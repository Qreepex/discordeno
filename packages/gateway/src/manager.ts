import type { AtLeastOne, BigString, Camelize, DiscordGetGatewayBot, DiscordMember, RequestGuildMembers } from '@discordeno/types'
import type { LeakyBucket } from '@discordeno/utils'
import { Collection, createLeakyBucket, delay, logger } from '@discordeno/utils'
import Shard from './Shard.js'
import type { ShardEvents, StatusUpdate, UpdateVoiceState } from './types.js'

export function createGatewayManager(options: CreateGatewayManagerOptions): GatewayManager {
  if (!options.connection) {
    options.connection = {
      url: 'wss://gateway.discord.gg',
      shards: 1,
      sessionStartLimit: {
        maxConcurrency: 1,
        remaining: 1000,
        total: 1000,
        resetAfter: 1000 * 60 * 60 * 24,
      },
    }
  }

  const gateway: GatewayManager = {
    events: options.events,
    compress: options.compress ?? false,
    intents: options.intents ?? 0,
    properties: {
      os: options.properties?.os ?? process.platform,
      browser: options.properties?.browser ?? 'Discordeno',
      device: options.properties?.device ?? 'Discordeno',
    },
    token: options.token,
    url: options.url ?? options.connection.url ?? 'wss://gateway.discord.gg',
    version: options.version ?? 10,
    connection: options.connection,
    totalShards: options.totalShards ?? options.connection.shards ?? 1,
    lastShardId: options.lastShardId ?? 0,
    firstShardId: options.firstShardId ?? 0,
    totalWorkers: options.totalWorkers ?? 4,
    shardsPerWorker: options.shardsPerWorker ?? 25,
    spawnShardDelay: options.spawnShardDelay ?? 5300,
    shards: new Map(),
    buckets: new Map(),
    cache: {
      requestMembers: {
        enabled: options.cache?.requestMembers?.enabled ?? false,
        pending: new Collection(),
      },
    },

    calculateTotalShards() {
      // Bots under 100k servers do not have access to total shards.
      if (gateway.totalShards < 100) {
        logger.debug(`[Gateway] Calculating total shards: ${gateway.totalShards}`)
        return gateway.totalShards
      }

      logger.debug(`[Gateway] Calculating total shards`, gateway.totalShards, gateway.connection.sessionStartLimit.maxConcurrency)
      // Calculate a multiple of `maxConcurrency` which can be used to connect to the gateway.
      return (
        Math.ceil(
          gateway.totalShards /
            // If `maxConcurrency` is 1 we can safely use 16.
            (gateway.connection.sessionStartLimit.maxConcurrency === 1 ? 16 : gateway.connection.sessionStartLimit.maxConcurrency),
        ) * gateway.connection.sessionStartLimit.maxConcurrency
      )
    },
    calculateWorkerId(shardId) {
      // Ignore decimal numbers.
      let workerId = Math.floor(shardId / gateway.shardsPerWorker)
      // If the workerId overflows the maximal allowed workers we by default just use to last worker.
      if (workerId >= gateway.totalWorkers) {
        // The Id of the last available worker is total -1
        workerId = gateway.totalWorkers - 1
      }

      logger.debug(
        `[Gateway] Calculating workerId: Shard: ${shardId} -> Worker: ${workerId} -> Per Worker: ${gateway.shardsPerWorker} -> Total: ${gateway.totalWorkers}`,
      )

      return workerId
    },
    prepareBuckets() {
      for (let i = 0; i < gateway.connection.sessionStartLimit.maxConcurrency; ++i) {
        logger.debug(`[Gateway] Preparing buckets for concurrency: ${i}`)
        gateway.buckets.set(i, {
          workers: [],
          leak: createLeakyBucket({
            max: 1,
            refillAmount: 1,
            // special number which is proven to be working dont change
            refillInterval: gateway.spawnShardDelay,
          }),
        })
      }

      // ORGANIZE ALL SHARDS INTO THEIR OWN BUCKETS
      for (let shardId = gateway.firstShardId; shardId <= gateway.lastShardId; ++shardId) {
        logger.debug(`[Gateway] Preparing buckets for shard: ${shardId}`)
        if (shardId >= gateway.totalShards) {
          throw new Error(`Shard (id: ${shardId}) is bigger or equal to the used amount of used shards which is ${gateway.totalShards}`)
        }

        const bucketId = shardId % gateway.connection.sessionStartLimit.maxConcurrency
        const bucket = gateway.buckets.get(bucketId)
        if (!bucket) {
          throw new Error(
            `Shard (id: ${shardId}) got assigned to an illegal bucket id: ${bucketId}, expected a bucket id between 0 and ${
              gateway.connection.sessionStartLimit.maxConcurrency - 1
            }`,
          )
        }

        // FIND A QUEUE IN THIS BUCKET THAT HAS SPACE
        // const worker = bucket.workers.find((w) => w.queue.length < gateway.shardsPerWorker);
        const workerId = gateway.calculateWorkerId(shardId)
        const worker = bucket.workers.find((w) => w.id === workerId)
        if (worker) {
          // IF THE QUEUE HAS SPACE JUST ADD IT TO THIS QUEUE
          worker.queue.push(shardId)
        } else {
          bucket.workers.push({ id: workerId, queue: [shardId] })
        }
      }
    },
    async spawnShards() {
      // PREPARES ALL SHARDS IN SPECIFIC BUCKETS
      gateway.prepareBuckets()

      // Prefer concurrency of forEach instead of forof
      await Promise.all(
        [...gateway.buckets.entries()].map(async ([bucketId, bucket]) => {
          for (const worker of bucket.workers) {
            for (const shardId of worker.queue) {
              await gateway.tellWorkerToIdentify(worker.id, shardId, bucketId)
            }
          }
        }),
      )
    },
    async shutdown(code, reason) {
      gateway.shards.forEach((shard) => shard.close(code, reason))

      await delay(5000)
    },
    async tellWorkerToIdentify(workerId, shardId, bucketId) {
      logger.debug(`[Gateway] tell worker to identify (${workerId}, ${shardId}, ${bucketId})`)
      return await gateway.identify(shardId)
    },
    async identify(shardId: number) {
      let shard = this.shards.get(shardId)
      logger.debug(`[Gateway] identifying ${shard ? 'existing' : 'new'} shard (${shardId})`)

      if (!shard) {
        shard = new Shard({
          id: shardId,
          connection: {
            compress: this.compress,
            intents: this.intents,
            properties: this.properties,
            token: this.token,
            totalShards: this.totalShards,
            url: this.url,
            version: this.version,
          },
          events: options.events,
        })

        this.shards.set(shardId, shard)
      }

      return await shard.identify()
    },
    async kill(shardId: number) {
      const shard = this.shards.get(shardId)
      if (!shard) {
        return logger.debug(`[Gateway] kill shard but not found (${shardId})`)
      }

      logger.debug(`[Gateway] kill shard (${shardId})`)
      this.shards.delete(shardId)
      return await shard.shutdown()
    },

    async requestIdentify() {
      logger.debug(`[Gateway] requesting identify`)
    },

    // Helpers methods below this

    calculateShardId(guildId, totalShards) {
      // If none is provided, use the total shards number from gateway object.
      if (!totalShards) totalShards = gateway.totalShards
      // If it is only 1 shard, it will always be shard id 0
      if (totalShards === 1) {
        logger.debug(`[Gateway] calculateShardId (1 shard)`)
        return 0
      }

      logger.debug(`[Gateway] calculateShardId (guildId: ${guildId}, totalShards: ${totalShards})`)
      return Number((BigInt(guildId) >> 22n) % BigInt(totalShards))
    },

    async joinVoiceChannel(guildId, channelId, options) {
      const shardId = gateway.calculateShardId(guildId)
      const shard = gateway.shards.get(shardId)
      if (!shard) {
        throw new Error(`Shard (id: ${shardId} not found`)
      }

      logger.debug(`[Gateway] joinVoiceChannel guildId: ${guildId} channelId: ${channelId}`)
      shard.joinVoiceChannel(guildId, channelId, options)
    },

    async editBotStatus(data) {
      logger.debug(`[Gateway] editBotStatus data: ${JSON.stringify(data)}`)
      await Promise.all(
        [...gateway.shards.values()].map(async (shard) => {
          gateway.editShardStatus(shard.id, data)
        }),
      )
    },

    async editShardStatus(shardId, data) {
      const shard = gateway.shards.get(shardId)
      if (!shard) {
        throw new Error(`Shard (id: ${shardId}) not found.`)
      }

      logger.debug(`[Gateway] editShardStatus shardId: ${shardId} -> data: ${JSON.stringify(data)}`)
      return await shard.editShardStatus(data)
    },

    async requestMembers(guildId, options) {
      const shardId = gateway.calculateShardId(guildId)
      const shard = gateway.shards.get(shardId)
      if (!shard) {
        throw new Error(`Shard (id: ${shardId}) not found.`)
      }

      logger.debug(`[Gateway] requestMembers guildId: ${guildId} -> options ${JSON.stringify(options)}`)
      return await shard.requestMembers(guildId, options)
    },

    async leaveVoiceChannel(guildId) {
      const shardId = gateway.calculateShardId(guildId)
      const shard = gateway.shards.get(shardId)
      if (!shard) {
        throw new Error(`Shard (id: ${shardId} not found`)
      }

      logger.debug(`[Gateway] leaveVoiceChannel guildId: ${guildId} Shard ${shardId}`)
      return await shard.leaveVoiceChannel(guildId)
    },
  }

  return gateway
}

export interface CreateGatewayManagerOptions {
  /**
   * Id of the first Shard which should get controlled by this manager.
   * @default 0
   */
  firstShardId?: number
  /**
   * Id of the last Shard which should get controlled by this manager.
   * @default 0
   */
  lastShardId?: number
  /**
   * Delay in milliseconds to wait before spawning next shard. OPTIMAL IS ABOVE 5100. YOU DON'T WANT TO HIT THE RATE LIMIT!!!
   * @default 5300
   */
  spawnShardDelay?: number
  /**
   * Total amount of shards your bot uses. Useful for zero-downtime updates or resharding.
   * @default 1
   */
  totalShards?: number
  /**
   * The amount of shards to load per worker.
   * @default 25
   */
  shardsPerWorker?: number
  /**
   * The total amount of workers to use for your bot.
   * @default 4
   */
  totalWorkers?: number
  /** Important data which is used by the manager to connect shards to the gateway. */
  connection?: Camelize<DiscordGetGatewayBot>
  /** Whether incoming payloads are compressed using zlib.
   *
   * @default false
   */
  compress?: boolean
  /** The calculated intent value of the events which the shard should receive.
   *
   * @default 0
   */
  intents?: number
  /** Identify properties to use */
  properties?: {
    /** Operating system the shard runs on.
     *
     * @default "darwin" | "linux" | "windows"
     */
    os: string
    /** The "browser" where this shard is running on.
     *
     * @default "Discordeno"
     */
    browser: string
    /** The device on which the shard is running.
     *
     * @default "Discordeno"
     */
    device: string
  }
  /** Bot token which is used to connect to Discord */
  token: string
  /** The URL of the gateway which should be connected to.
   *
   * @default "wss://gateway.discord.gg"
   */
  url?: string
  /** The gateway version which should be used.
   *
   * @default 10
   */
  version?: number
  /** The events handlers */
  events: ShardEvents
  /** This managers cache related settings. */
  cache?: {
    requestMembers?: {
      /**
       * Whether or not request member requests should be cached.
       * @default false
       */
      enabled?: boolean
      /** The pending requests. */
      pending: Collection<string, RequestMemberRequest>
    }
  }
}

export interface GatewayManager extends Required<CreateGatewayManagerOptions> {
  /** The max concurrency buckets. Those will be created when the `spawnShards` (which calls `prepareBuckets` under the hood) function gets called. */
  buckets: Map<
    number,
    {
      workers: Array<{ id: number; queue: number[] }>
      leak: LeakyBucket
    }
  >
  /** The shards that are created. */
  shards: Map<number, Shard>
  /** Determine max number of shards to use based upon the max concurrency. */
  calculateTotalShards: () => number
  /** Determine the id of the worker which is handling a shard. */
  calculateWorkerId: (shardId: number) => number
  /** Prepares all the buckets that are available for identifying the shards. */
  prepareBuckets: () => void
  /** Start identifying all the shards. */
  spawnShards: () => Promise<void>
  /** Shutdown all shards. */
  shutdown: (code: number, reason: string) => Promise<void>
  /** Allows users to hook in and change to communicate to different workers across different servers or anything they like. For example using redis pubsub to talk to other servers. */
  tellWorkerToIdentify: (workerId: number, shardId: number, bucketId: number) => Promise<void>
  /** Tell the manager to identify a Shard. If this Shard is not already managed this will also add the Shard to the manager. */
  identify: (shardId: number) => Promise<void>
  /** Kill a shard. Close a shards connection to Discord's gateway (if any) and remove it from the manager. */
  kill: (shardId: number) => Promise<void>
  /** This function communicates with the parent manager, in order to know whether this manager is allowed to identify a new shard. */
  requestIdentify: () => Promise<void>
  /** Calculates the number of shards based on the guild id and total shards. */
  calculateShardId: (guildId: BigString, totalShards?: number) => number
  /**
   * Connects the bot user to a voice or stage channel.
   *
   * This function sends the _Update Voice State_ gateway command over the gateway behind the scenes.
   *
   * @param guildId - The ID of the guild the voice channel to leave is in.
   * @param channelId - The ID of the channel you want to join.
   *
   * @remarks
   * Requires the `CONNECT` permission.
   *
   * Fires a _Voice State Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#update-voice-state}
   */
  joinVoiceChannel: (guildId: BigString, channelId: BigString, options?: AtLeastOne<Omit<UpdateVoiceState, 'guildId' | 'channelId'>>) => Promise<void>
  /**
   * Edits the bot status in all shards that this gateway manages.
   *
   * @param data The status data to set the bots status to.
   * @returns Promise<void>
   */
  editBotStatus: (data: StatusUpdate) => Promise<void>
  /**
   * Edits the bot's status on one shard.
   *
   * @param shardId The shard id to edit the status for.
   * @param data The status data to set the bots status to.
   * @returns Promise<void>
   */
  editShardStatus: (shardId: number, data: StatusUpdate) => Promise<void>
  /**
   * Fetches the list of members for a guild over the gateway.
   *
   * @param guildId - The ID of the guild to get the list of members for.
   * @param options - The parameters for the fetching of the members.
   *
   * @remarks
   * If requesting the entire member list:
   * - Requires the `GUILD_MEMBERS` intent.
   *
   * If requesting presences ({@link RequestGuildMembers.presences | presences} set to `true`):
   * - Requires the `GUILD_PRESENCES` intent.
   *
   * If requesting a prefix ({@link RequestGuildMembers.query | query} non-`undefined`):
   * - Returns a maximum of 100 members.
   *
   * If requesting a users by ID ({@link RequestGuildMembers.userIds | userIds} non-`undefined`):
   * - Returns a maximum of 100 members.
   *
   * Fires a _Guild Members Chunk_ gateway event for every 1000 members fetched.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#request-guild-members}
   */
  requestMembers: (guildId: BigString, options?: Omit<RequestGuildMembers, 'guildId'>) => Promise<Camelize<DiscordMember[]>>
  /**
   * Leaves the voice channel the bot user is currently in.
   *
   * This function sends the _Update Voice State_ gateway command over the gateway behind the scenes.
   *
   * @param guildId - The ID of the guild the voice channel to leave is in.
   *
   * @remarks
   * Fires a _Voice State Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#update-voice-state}
   */
  leaveVoiceChannel: (guildId: BigString) => Promise<void>
}

export interface RequestMemberRequest {
  /** The unique nonce for this request. */
  nonce: string
  /** The resolver handler to run when all members arrive. */
  resolve: (value: Camelize<DiscordMember[]> | PromiseLike<Camelize<DiscordMember[]>>) => void
  /** The members that have already arrived for this request. */
  members: Camelize<DiscordMember[]>
}