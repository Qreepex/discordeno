import type { ApplicationCommandPermissions, AtLeastOne, BeginGuildPrune, BigString, Camelize, CreateApplicationCommand, CreateAutoModerationRuleOptions, CreateChannelInvite, CreateForumPostWithMessage, CreateGuild, CreateGuildBan, CreateGuildChannel, CreateGuildEmoji, CreateGuildFromTemplate, CreateGuildRole, CreateGuildStickerOptions, CreateMessageOptions, CreateScheduledEvent, CreateStageInstance, CreateTemplate, DeleteWebhookMessageOptions, DiscordActiveThreads, DiscordApplication, DiscordApplicationCommand, DiscordApplicationCommandPermissions, DiscordArchivedThreads, DiscordAuditLog, DiscordAutoModerationRule, DiscordBan, DiscordChannel, DiscordEmoji, DiscordFollowedChannel, DiscordGetGatewayBot, DiscordGuild, DiscordGuildPreview, DiscordGuildWidget, DiscordGuildWidgetSettings, DiscordIntegration, DiscordInvite, DiscordInviteMetadata, DiscordMember, DiscordMemberWithUser, DiscordMessage, DiscordModifyGuildWelcomeScreen, DiscordPrunedCount, DiscordRole, DiscordScheduledEvent, DiscordStageInstance, DiscordSticker, DiscordStickerPack, DiscordTemplate, DiscordThreadMember, DiscordUser, DiscordVanityUrl, DiscordVoiceRegion, DiscordWebhook, DiscordWelcomeScreen, EditAutoModerationRuleOptions, EditBotMemberOptions, EditChannelPermissionOverridesOptions, EditGuildRole, EditGuildStickerOptions, EditMessage, EditOwnVoiceState, EditScheduledEvent, EditStageInstanceOptions, EditUserVoiceState, ExecuteWebhook, GetBans, GetGuildAuditLog, GetGuildPruneCountQuery, GetInvite, GetMessagesOptions, GetReactions, GetScheduledEvents, GetScheduledEventUsers, GetWebhookMessageOptions, InteractionCallbackData, InteractionResponse, ListArchivedThreads, ListGuildMembers, MfaLevels, ModifyChannel, ModifyGuild, ModifyGuildChannelPositions, ModifyGuildEmoji, ModifyGuildMember, ModifyGuildTemplate, ModifyRolePositions, ModifyWebhook, SearchMembers, StartThreadWithMessage, StartThreadWithoutMessage, WithReason } from "@discordeno/types"
import type { InvalidRequestBucket } from './invalidBucket.js'
import type { Queue } from './queue.js'
import type { RestRoutes } from './typings/routes.js'

export interface CreateRestManagerOptions {
  /** The bot token which will be used to make requests. */
  token: string
  /**
   * For old bots that have a different bot id and application id.
   * @default bot id from token
   */
  applicationId?: BigString
  /**
   * The base url to connect to. If you create a proxy rest, that url would go here.
   * IT SHOULD NOT END WITH A /
   * @default https://discord.com/api
   */
  baseUrl?: string
  /**
   * The api versions which can be used to make requests.
   * @default 10
   */
  version?: ApiVersions
}

export interface RestManager {
  /** The bot token which will be used to make requests. */
  token: string
  /** The application id. Normally this is not required for recent bots but old bot's application id is sometimes different from the bot id so it is required for those bots. */
  applicationId: bigint
  /** The api version to use when making requests. Only the latest supported version will be tested. */
  version: ApiVersions
  /**
   * The base url to connect to. If you create a proxy rest, that url would go here.
   * IT SHOULD NOT END WITH A /
   * @default https://discord.com/api
   */
  baseUrl: string
  /** The maximum amount of times a request should be retried. Defaults to Infinity */
  maxRetryCount: number
  /** Whether or not the manager is rate limited globally across all requests. Defaults to false. */
  globallyRateLimited: boolean
  /** Whether or not the rate limited paths are being processed to allow requests to be made once time is up. Defaults to false. */
  processingRateLimitedPaths: boolean
  /** The time in milliseconds to wait before deleting this queue if it is empty. Defaults to 60000(one minute). */
  deleteQueueDelay: number
  /** The queues that hold all the requests to be processed. */
  queues: Map<string, Queue>
  /** The paths that are currently rate limited. */
  rateLimitedPaths: Map<string, RestRateLimitedPath>
  /** The bucket for handling any invalid requests.  */
  invalidBucket: InvalidRequestBucket
  /** The routes that are available for this manager. */
  routes: RestRoutes
  /** Check the rate limits for a url or a bucket. */
  checkRateLimits: (url: string) => number | false
  /** Reshapes and modifies the obj as needed to make it ready for discords api. */
  changeToDiscordFormat: (obj: any) => any
  /** Creates the request body and headers that are necessary to send a request. Will handle different types of methods and everything necessary for discord. */
  createRequest: (options: CreateRequestBodyOptions) => RequestBody
  /** This will create a infinite loop running in 1 seconds using tail recursion to keep rate limits clean. When a rate limit resets, this will remove it so the queue can proceed. */
  processRateLimitedPaths: () => void
  /** Processes the rate limit headers and determines if it needs to be rate limited and returns the bucket id if available */
  processHeaders: (url: string, headers: Headers) => string | undefined
  /** Sends a request to the api. */
  sendRequest: (options: SendRequestOptions) => Promise<void>
  /** Split a url to separate rate limit buckets based on major/minor parameters. */
  simplifyUrl: (url: string, method: RequestMethods) => string
  /** Make a request to be sent to the api. */
  makeRequest: <T = unknown>(method: RequestMethods, url: string, body?: Record<string, any>, options?: Record<string, any>) => Promise<T>
  /** Takes a request and processes it into a queue. */
  processRequest: (request: SendRequestOptions) => void
  /** Make a get request to the api */
  get: <T = void>(url: string) => Promise<Camelize<T>>
  /** Make a post request to the api. */
  post: <T = void>(url: string, body?: Record<string, any>) => Promise<Camelize<T>>
  /** Make a put request to the api. */
  put: <T = void>(url: string, body?: Record<string, any>, options?: Record<string, any>) => Promise<Camelize<T>>
  /** Make a delete request to the api. */
  delete: (url: string, body?: Record<string, any>) => Promise<void>
  /** Make a patch request to the api. */
  patch: <T = void>(url: string, body?: Record<string, any>) => Promise<Camelize<T>>
  /**
   * Adds a reaction to a message.
   *
   * @param channelId - The ID of the channel the message to add a reaction to is in.
   * @param messageId - The ID of the message to add a reaction to.
   * @param reaction - The reaction to add to the message.
   * @returns
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * If nobody else has reacted to the message:
   * - Requires the `ADD_REACTIONS` permission.
   *
   * Fires a _Message Reaction Add_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
   */
  addReaction: (channelId: BigString, messageId: BigString, reaction: string) => Promise<void>
  /**
   * Adds multiple a reaction to a message.
   *
   * This function uses the `addReaction()` helper behind the scenes.
   *
   * @param channelId - The ID of the channel the message to add reactions to is in.
   * @param messageId - The ID of the message to add the reactions to.
   * @param reactions - The reactions to add to the message.
   * @param ordered - Whether the reactions must be added in order or not.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * If nobody else has reacted to the message:
   * - Requires the `ADD_REACTIONS` permission.
   *
   * Fires a _Message Reaction Add_ gateway event for every reaction added.
   */
  addReactions: (channelId: BigString, messageId: BigString, reactions: string[], ordered?: boolean) => Promise<void>
  /**
   * Adds a role to a member.
   *
   * @param guildId - The ID of the guild the member to add the role to is in.
   * @param userId - The user ID of the member to add the role to.
   * @param roleId - The ID of the role to add to the member.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Member Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  addRole: (guildId: BigString, userId: BigString, roleId: BigString, reason?: string) => Promise<void>
  /**
   * Adds a member to a thread.
   *
   * @param channelId - The ID of the thread to add the member to.
   * @param userId - The user ID of the member to add to the thread.
   *
   * @remarks
   * Requires the ability to send messages in the thread.
   * Requires the thread not be archived.
   *
   * Fires a _Thread Members Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#add-thread-member}
   */
  addThreadMember: (channelId: BigString, userId: BigString) => Promise<void>
  /**
   * Creates an automod rule in a guild.
   *
   * @param guildId - The ID of the guild to create the rule in.
   * @param options - The parameters for the creation of the rule.
   * @returns An instance of the created {@link DiscordAutoModerationRule}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires an _Auto Moderation Rule Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutomodRule: (guildId: BigString, options: CreateAutoModerationRuleOptions) => Promise<Camelize<DiscordAutoModerationRule>>
  /**
   * Creates a channel within a guild.
   *
   * @param guildId - The ID of the guild to create the channel within.
   * @param options - The parameters for the creation of the channel.
   * @returns An instance of the created {@link DiscordChannel}.
   *
   * @remarks
   * Requires the `MANAGE_CHANNELS` permission.
   *
   * If setting permission overwrites, only the permissions the bot user has in the guild can be allowed or denied.
   *
   * Setting the `MANAGE_ROLES` permission is only possible for guild administrators.
   *
   * Fires a _Channel Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   */
  createChannel: (guildId: BigString, options: CreateGuildChannel) => Promise<Camelize<DiscordChannel>>
  /**
   * Creates an emoji in a guild.
   *
   * @param guildId - The ID of the guild in which to create the emoji.
   * @param options - The parameters for the creation of the emoji.
   * @returns An instance of the created {@link DiscordEmoji}.
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   *
   * Emojis have a maximum file size of 256 kilobits. Attempting to upload a larger emoji will cause the route to return 400 Bad Request.
   *
   * Fires a _Guild Emojis Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  createEmoji: (guildId: BigString, options: CreateGuildEmoji) => Promise<Camelize<DiscordEmoji>>
  /**
   * Creates a new thread in a forum channel, and sends a message within the created thread.
   *
   * @param channelId - The ID of the forum channel to create the thread within.
   * @param options - The parameters for the creation of the thread.
   * @returns An instance of {@link DiscordChannel} with a nested {@link Message} object.
   *
   * @remarks
   * Requires the `CREATE_MESSAGES` permission.
   *
   * Fires a _Thread Create_ gateway event.
   * Fires a _Message Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-channel}
   *
   * @experimental
   */
  createForumThread: (channelId: BigString, options: CreateForumPostWithMessage) => Promise<Camelize<DiscordChannel>>
  /**
   * Creates an application command accessible globally; across different guilds and channels.
   *
   * @param command - The command to create.
   * @returns An instance of the created {@link ApplicationCommand}.
   *
   * @remarks
   * ⚠️ Creating a command with the same name as an existing command for your application will overwrite the old command.
   * ⚠️ Global commands once created are cached for periods of __an hour__, so changes made to existing commands will take an hour to surface.
   * ⚠️ You can only create up to 200 _new_ commands daily.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
   */
  createGlobalApplicationCommand: (command: CreateApplicationCommand) => Promise<Camelize<DiscordApplicationCommand>>
  /**
   * Creates a guild.
   *
   * @param options - The parameters for the creation of the guild.
   * @returns An instance of the created {@link DiscordGuild}.
   *
   * @remarks
   * ⚠️ This route can only be used by bots in __fewer than 10 guilds__.
   *
   * Fires a _Guild Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   */
  createGuild: (options: CreateGuild) => Promise<Camelize<DiscordGuild>>
  /**
   * Creates an application command only accessible in a specific guild.
   *
   * @param command - The command to create.
   * @param guildId - The ID of the guild to create the command for.
   * @returns An instance of the created {@link ApplicationCommand}.
   *
   * @remarks
   * ⚠️ Creating a command with the same name as an existing command for your application will overwrite the old command.
   * ⚠️ You can only create up to 200 _new_ commands daily.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command}
   */
  createGuildApplicationCommand: (command: CreateApplicationCommand, guildId: BigString) => Promise<Camelize<DiscordApplicationCommand>>
  /**
   * Creates a guild from a template.
   *
   * @param templateCode - The code of the template.
   * @param options - The parameters for the creation of the guild.
   * @returns An instance of the created {@link Guild}.
   *
   * @remarks
   * ⚠️ This route can only be used by bots in __fewer than 10 guilds__.
   *
   * Fires a _Guild Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  createGuildFromTemplate: (templateCode: string, options: CreateGuildFromTemplate) => Promise<Camelize<DiscordGuild>>
  /**
   * Create a new sticker for the guild.
   *
   * @param guildId The ID of the guild to get
   * @return A {@link DiscordSticker}
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   * Fires a Guild Stickers Update Gateway event.
   * Every guilds has five free sticker slots by default, and each Boost level will grant access to more slots.
   * Lottie stickers can only be uploaded on guilds that have either the `VERIFIED` and/or the `PARTNERED` guild feature.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   */
  createGuildSticker: (guildId: BigString, options: CreateGuildStickerOptions) => Promise<Camelize<DiscordSticker>>
  /**
   * Creates a template from a guild.
   *
   * @param guildId - The ID of the guild to create the template from.
   * @param options - The parameters for the creation of the template.
   * @returns An instance of the created {@link Template}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  createGuildTemplate: (guildId: BigString, options: CreateTemplate) => Promise<Camelize<DiscordTemplate>>
  /**
   * Creates an invite to a channel in a guild.
   *
   * @param channelId - The ID of the channel to create the invite to.
   * @param options - The parameters for the creation of the invite.
   * @returns An instance of the created {@link DiscordInvite}.
   *
   * @remarks
   * Requires the `CREATE_INSTANT_INVITE` permission.
   *
   * Fires an _Invite Create_ gateway event.
   *
   * @privateRemarks
   * The request body is not optional, and an empty JSON object must be sent regardless of whether any fields are being transmitted.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite}
   */
  createInvite: (channelId: BigString, options?: CreateChannelInvite) => Promise<Camelize<DiscordInvite>>
  /**
   * Creates a role in a guild.
   *
   * @param guildId - The ID of the guild to create the role in.
   * @param options - The parameters for the creation of the role.
   * @returns An instance of the created {@link DiscordRole}.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Role Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   */
  createRole: (guildId: BigString, options: CreateGuildRole, reason?: string) => Promise<Camelize<DiscordRole>>
  /**
   * Creates a scheduled event in a guild.
   *
   * @param guildId - The ID of the guild to create the scheduled event in.
   * @param options - The parameters for the creation of the scheduled event.
   * @returns An instance of the created {@link ScheduledEvent}.
   *
   * @remarks
   * Requires the `MANAGE_EVENTS` permission.
   *
   * A guild can only have a maximum of 100 events with a status of {@link ScheduledEventStatus.Active} or {@link ScheduledEventStatus.Scheduled} (inclusive).
   *
   * Fires a _Guild Scheduled Event Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  createScheduledEvent: (guildId: BigString, options: CreateScheduledEvent) => Promise<Camelize<DiscordScheduledEvent>>
  /**
   * Creates a stage instance associated with a stage channel.
   *
   * @param options - The parameters for the creation of the stage instance.
   * @returns An instance of the created {@link DiscordStageInstance}.
   *
   * @remarks
   * Requires the user to be a moderator of the stage channel.
   *
   * Fires a _Stage Instance Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance: (options: CreateStageInstance) => Promise<Camelize<DiscordStageInstance>>
  /**
   * Creates a webhook.
   *
   * @param channelId - The ID of the channel to create the webhook in.
   * @param options - The parameters for the creation of the webhook.
   * @returns An instance of the created {@link DiscordWebhook}.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * ⚠️ The webhook name must not contain the string 'clyde' (case-insensitive).
   *
   * Fires a _Webhooks Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  createWebhook: (channelId: BigString, options: CreateWebhook) => Promise<Camelize<DiscordWebhook>>
  /**
   * Deletes an automod rule.
   *
   * @param guildId - The ID of the guild to delete the rule from.
   * @param ruleId - The ID of the automod rule to delete.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires an _Auto Moderation Rule Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  deleteAutomodRule: (guildId: BigString, ruleId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a channel from within a guild.
   *
   * @param channelId - The ID of the channel to delete.
   * @returns An instance of the deleted {@link Channel}.
   *
   * @remarks
   * For community guilds, the _Rules_, _Guidelines_ and _Community Update_ channels cannot be deleted.
   *
   * If the channel is a thread:
   * - Requires the `MANAGE_THREADS` permission.
   *
   * - Fires a _Thread Delete_ gateway event.
   *
   * Otherwise:
   * - Requires the `MANAGE_CHANNELS` permission.
   *
   * - ⚠️ Deleting a category channel does not delete its child channels.
   *   Instead, they will have their `parent_id` property removed, and a `Channel Update` gateway event will fire for each of them.
   *
   * - Fires a _Channel Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#deleteclose-channel}
   */
  deleteChannel: (channelId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a permission override for a user or role in a channel.
   *
   * @param channelId - The ID of the channel to delete the permission override of.
   * @param overwriteId - The ID of the permission override to delete.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Channel Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-permission}
   */
  deleteChannelPermissionOverride: (channelId: BigString, overwriteId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes an emoji from a guild.
   *
   * @param guildId - The ID of the guild from which to delete the emoji.
   * @param id - The ID of the emoji to delete.
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   *
   * Fires a _Guild Emojis Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  deleteEmoji: (guildId: BigString, id: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a follow-up message to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @param messageId - The ID of the message to delete.
   *
   * @remarks
   * Unlike `deleteMessage()`, this endpoint allows the bot user to act without needing to see the channel the message is in.
   *
   * Fires a _Message Delete_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-followup-message}
   */
  deleteFollowupMessage: (token: string, messageId: BigString) => Promise<void>
  /**
   * Deletes an application command registered globally.
   *
   * @param commandId - The ID of the command to delete.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command}
   */
  deleteGlobalApplicationCommand: (commandId: BigString) => Promise<void>
  /**
   * Deletes a guild.
   *
   * @param guildId - The ID of the guild to delete.
   *
   * @remarks
   * The bot user must be the owner of the guild.
   *
   * Fires a _Guild Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   */
  deleteGuild: (guildId: BigString) => Promise<void>
  /**
   * Deletes an application command registered in a guild.
   *
   * @param guildId - The ID of the guild to delete the command from.
   * @param commandId - The ID of the command to delete from the guild.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command}
   */
  deleteGuildApplicationCommand: (commandId: BigString, guildId: BigString) => Promise<void>
  /**
   * Delete a new sticker for the guild.
   *
   * @param guildId The ID of the guild to get
   * @return A {@link DiscordSticker}
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   * Fires a Guild Stickers Update Gateway event.
   * Every guilds has five free sticker slots by default, and each Boost level will grant access to more slots.
   * Lottie stickers can only be uploaded on guilds that have either the `VERIFIED` and/or the `PARTNERED` guild feature.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   */
  deleteGuildSticker: (guildId: BigString, stickerId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a template from a guild.
   *
   * @param guildId - The ID of the guild to delete the template from.
   * @param templateCode - The code of the template to delete.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteGuildTemplate: (guildId: BigString, templateCode: string) => Promise<void>
  /**
   * Deletes an integration attached to a guild.
   *
   * @param guildId - The ID of the guild from which to delete the integration.
   * @param integrationId - The ID of the integration to delete from the guild.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Deletes all webhooks associated with the integration, and kicks the associated bot if there is one.
   *
   * Fires a _Guild Integrations Update_ gateway event.
   * Fires a _Integration Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
   */
  deleteIntegration: (guildId: BigString, integrationId: BigString) => Promise<void>
  /**
   * Deletes an invite to a channel.
   *
   * @param inviteCode - The invite code of the invite to delete.
   *
   * @remarks
   * Requires the `MANAGE_CHANNELS` permission.
   *
   * Fires an _Invite Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-channel-invite}
   */
  deleteInvite: (inviteCode: string, reason?: string) => Promise<void>
  /**
   * Deletes a message from a channel.
   *
   * @param channelId - The ID of the channel to delete the message from.
   * @param messageId - The ID of the message to delete from the channel.
   *
   * @remarks
   * If not deleting own message:
   * - Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Message Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-message}
   */
  deleteMessage: (channelId: BigString, messageId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes multiple messages from a channel.
   *
   * @param channelId - The ID of the channel to delete the messages from.
   * @param messageIds - The IDs of the messages to delete from the channel.
   *
   * @remarks
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * ⚠️ Messages older than 2 weeks old cannot be deleted.
   *
   * Fires a _Message Delete Bulk_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   */
  deleteMessages: (channelId: BigString, messageIds: BigString[], reason?: string) => Promise<void>
  /**
   * Deletes the initial message response to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   *
   * @remarks
   * Unlike `deleteMessage()`, this endpoint allows the bot user to act without needing to see the channel the message is in.
   *
   * Fires a _Message Delete_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
   */
  deleteOriginalInteractionResponse: (token: string) => Promise<void>
  /**
   * Deletes a reaction added by the bot user from a message.
   *
   * @param channelId - The ID of the channel the message to delete the reaction from is in.
   * @param messageId - The ID of the message to delete the reaction from.
   * @param reaction - The reaction to delete from the message.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * Fires a _Message Reaction Remove_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-own-reaction}
   */
  deleteOwnReaction: (channelId: BigString, messageId: BigString, reaction: string) => Promise<void>
  /**
   * Deletes all reactions for all emojis from a message.
   *
   * @param channelId - The ID of the channel the message to delete the reactions from is in.
   * @param messageId - The ID of the message to delete the reactions from.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Message Reaction Remove All_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions}
   */
  deleteReactionsAll: (channelId: BigString, messageId: BigString) => Promise<void>
  /**
   * Deletes all reactions for an emoji from a message.
   *
   * @param channelId - The ID of the channel the message to delete the reactions from is in.
   * @param messageId - The ID of the message to delete the reactions from.
   * @param reaction - The reaction to remove from the message.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Message Reaction Remove Emoji_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji}
   */
  deleteReactionsEmoji: (channelId: BigString, messageId: BigString, reaction: string) => Promise<void>
  /**
   * Deletes a role from a guild.
   *
   * @param guildId - The ID of the guild to delete the role from.
   * @param roleId - The ID of the role to delete.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Role Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
   */
  deleteRole: (guildId: BigString, roleId: BigString) => Promise<void>
  /**
   * Deletes a scheduled event from a guild.
   *
   * @param guildId - The ID of the guild to delete the scheduled event from.
   * @param eventId - The ID of the scheduled event to delete.
   *
   * @remarks
   * Requires the `MANAGE_EVENTS` permission.
   *
   * Fires a _Guild Scheduled Event Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteScheduledEvent: (guildId: BigString, eventId: BigString) => Promise<void>
  /**
   * Deletes the stage instance associated with a stage channel, if one exists.
   *
   * @param channelId - The ID of the stage channel the stage instance is associated with.
   *
   * @remarks
   * Requires the user to be a moderator of the stage channel.
   *
   * Fires a _Stage Instance Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance: (channelId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a user's reaction from a message.
   *
   * @param channelId - The ID of the channel the message to delete the reaction from is in.
   * @param messageId - The ID of the message to delete the reaction from.
   * @param userId - The ID of the user whose reaction to delete.
   * @param reaction - The reaction to delete from the message.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Message Reaction Remove_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-user-reaction}
   */
  deleteUserReaction: (channelId: BigString, messageId: BigString, userId: BigString, reaction: string) => Promise<void>
  /**
   * Deletes a webhook.
   *
   * @param webhookId - The ID of the webhook to delete.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * Fires a _Webhooks Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhook: (webhookId: BigString, reason?: string) => Promise<void>
  /**
   * Deletes a webhook message.
   *
   * @param webhookId - The ID of the webhook to delete the message belonging to.
   * @param token - The webhook token, used to manage the webhook.
   * @param messageId - The ID of the message to delete.
   * @param options - The parameters for the deletion of the message.
   *
   * @remarks
   * Fires a _Message Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhookMessage: (webhookId: BigString, token: string, messageId: BigString, options?: DeleteWebhookMessageOptions) => Promise<void>
  /**
   * Deletes a webhook message using the webhook token, thereby bypassing the need for authentication + permissions.
   *
   * @param webhookId - The ID of the webhook to delete the message belonging to.
   * @param token - The webhook token, used to delete the webhook.
   *
   * @remarks
   * Fires a _Message Delete_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
   */
  deleteWebhookWithToken: (webhookId: BigString, token: string) => Promise<void>
  /**
   * Edits the permissions for a guild application command.
   *
   * @param guildId - The ID of the guild the command is registered in.
   * @param commandId - The ID of the command to edit the permissions of.
   * @param bearerToken - The bearer token to use to make the request.
   * @param options - The parameters for the edit of the command permissions.
   * @returns An instance of the edited {@link ApplicationCommandPermission}.
   *
   * @remarks
   * The bearer token requires the `applications.commands.permissions.update` scope to be enabled, and to have access to the guild whose ID has been provided in the parameters.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
   */
  editApplicationCommandPermissions: (
    guildId: BigString,
    commandId: BigString,
    bearerToken: string,
    options: ApplicationCommandPermissions[],
  ) => Promise<Camelize<DiscordApplicationCommandPermissions>>
  /**
   * Edits an automod rule.
   *
   * @param guildId - The ID of the guild to edit the rule in.
   * @param ruleId - The ID of the rule to edit.
   * @param options - The parameters for the edit of the rule.
   * @returns An instance of the edited {@link DiscordAutoModerationRule}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires an _Auto Moderation Rule Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  editAutomodRule: (
    guildId: BigString,
    ruleId: BigString,
    options: Partial<EditAutoModerationRuleOptions>,
  ) => Promise<Camelize<DiscordAutoModerationRule>>
  /**
   * Modifies the bot's username or avatar.
   * NOTE: username: if changed may cause the bot's discriminator to be randomized.
   */
  editBotProfile: (options: { username?: string; botAvatarURL?: string | null }) => Promise<Camelize<DiscordUser>>
  /**
   * Edits a channel's settings.
   *
   * @param channelId - The ID of the channel to edit.
   * @param options - The parameters for the edit of the channel.
   * @returns An instance of the edited {@link DiscordChannel}.
   *
   * @remarks
   * If editing a channel of type {@link ChannelTypes.GroupDm}:
   * - Fires a _Channel Update_ gateway event.
   *
   * If editing a thread channel:
   * - Requires the `MANAGE_THREADS` permission __unless__ if setting the `archived` property to `false` when the `locked` property is also `false`, in which case only the `SEND_MESSAGES` permission is required.
   *
   * - Fires a _Thread Update_ gateway event.
   *
   * If editing a guild channel:
   * - Requires the `MANAGE_CHANNELS` permission.
   *
   * - If modifying permission overrides:
   *   - Requires the `MANAGE_ROLES` permission.
   *
   *   - Only permissions the bot user has in the guild or parent channel can be allowed/denied __unless__ the bot user has a `MANAGE_ROLES` permission override in the channel.
   *
   * - If modifying a channel of type {@link ChannelTypes.GuildCategory}:
   *     - Fires a _Channel Update_ gateway event for each child channel impacted in this change.
   * - Otherwise:
   *     - Fires a _Channel Update_ gateway event.
   */
  editChannel: (channelId: BigString, options: ModifyChannel) => Promise<Camelize<DiscordChannel>>
  /**
   * Edits the permission overrides for a user or role in a channel.
   *
   * @param channelId - The ID of the channel to edit the permission overrides of.
   * @param options - The permission override.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Only permissions the bot user has in the guild or parent channel can be allowed/denied __unless__ the bot user has a `MANAGE_ROLES` permission override in the channel.
   *
   * Fires a _Channel Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions}
   */
  editChannelPermissionOverrides: (channelId: BigString, options: EditChannelPermissionOverridesOptions) => Promise<void>
  /**
   * Edits the positions of a set of channels in a guild.
   *
   * @param guildId - The ID of the guild in which to edit the positions of the channels.
   * @param channelPositions - A set of objects defining the updated positions of the channels.
   *
   * @remarks
   * Requires the `MANAGE_CHANNELS` permission.
   *
   * Fires a _Channel Update_ gateway event for every channel impacted in this change.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   */
  editChannelPositions: (guildId: BigString, channelPositions: ModifyGuildChannelPositions[]) => Promise<void>
  /**
   * Edits an emoji.
   *
   * @param guildId - The ID of the guild in which to edit the emoji.
   * @param id - The ID of the emoji to edit.
   * @param options - The parameters for the edit of the emoji.
   * @returns An instance of the updated {@link DiscordEmoji}.
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   *
   * Fires a `Guild Emojis Update` gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  editEmoji: (guildId: BigString, id: BigString, options: ModifyGuildEmoji) => Promise<Camelize<DiscordEmoji>>
  /**
   * Edits a follow-up message to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @param messageId - The ID of the message to edit.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link Message}.
   *
   * @remarks
   * Unlike `editMessage()`, this endpoint allows the bot user to act without needing to see the channel the message is in.
   *
   * Does not support ephemeral follow-up messages due to these being stateless.
   *
   * Fires a _Message Update_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-followup-message}
   */
  editFollowupMessage: (token: string, messageId: BigString, options: InteractionCallbackData) => Promise<Camelize<DiscordMessage>>
  /**
   * Edits a global application command.
   *
   * @param commandId - The ID of the command to edit.
   * @param options - The parameters for the edit of the command.
   * @returns An instance of the edited {@link ApplicationCommand}.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command}
   */
  editGlobalApplicationCommand: (commandId: BigString, options: CreateApplicationCommand) => Promise<Camelize<DiscordApplicationCommand>>
  /**
   * Edits a guild's settings.
   *
   * @param guildId - The ID of the guild to edit.
   * @param shardId - The ID of the shard the guild is in.
   * @param options - The parameters for the edit of the guild.
   * @returns An instance of the edited {@link Guild}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * If attempting to add or remove the {@link GuildFeatures.Community} feature:
   * - Requires the `ADMINISTRATOR` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   */
  editGuild: (guildId: BigString, options: ModifyGuild) => Promise<Camelize<DiscordGuild>>
  /**
   * Edits an application command registered in a guild.
   *
   * @param guildId - The ID of the guild the command is registered in.
   * @param commandId - The ID of the command to edit.
   * @param options - The parameters for the edit of the command.
   * @returns An instance of the edited {@link ApplicationCommand}.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command}
   */
  editGuildApplicationCommand: (
    commandId: BigString,
    guildId: BigString,
    options: CreateApplicationCommand,
  ) => Promise<Camelize<DiscordApplicationCommand>>
  /** Modify a guild's MFA level. Requires guild ownership. */
  editGuildMfaLevel: (guildId: BigString, mfaLevel: MfaLevels, reason?: string) => Promise<void>
  /**
   * Edit the given sticker.
   *
   * @param guildId The ID of the guild to get
   * @return A {@link DiscordSticker}
   *
   * @remarks
   * Requires the `MANAGE_EMOJIS_AND_STICKERS` permission.
   * Fires a Guild Stickers Update Gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   */
  editGuildSticker: (guildId: BigString, stickerId: BigString, options: AtLeastOne<EditGuildStickerOptions>) => Promise<Camelize<DiscordSticker>>
  /**
   * Edits a template's settings.
   *
   * @param guildId - The ID of the guild to edit a template of.
   * @param templateCode - The code of the template to edit.
   * @param options - The parameters for the edit of the template.
   * @returns An instance of the edited {@link Template}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  editGuildTemplate: (guildId: BigString, templateCode: string, options: ModifyGuildTemplate) => Promise<Camelize<DiscordTemplate>>
  /**
   * Edits a message.
   *
   * @param channelId - The ID of the channel to edit the message in.
   * @param messageId - The IDs of the message to edit.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link Message}.
   *
   * @remarks
   * If editing another user's message:
   * - Requires the `MANAGE_MESSAGES` permission.
   * - Only the {@link EditMessage.flags | flags} property of the {@link options} object parameter can be edited.
   *
   * Fires a _Message Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  editMessage: (channelId: BigString, messageId: BigString, options: EditMessage) => Promise<Camelize<DiscordMessage>>
  /**
   * Edits the initial message response to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @param options - The parameters for the edit of the response.
   * @returns An instance of the edited {@link Message}.
   *
   * @remarks
   * Unlike `editMessage()`, this endpoint allows the bot user to act without needing to see the channel the message is in.
   *
   * Does not support ephemeral follow-up messages due to these being stateless.
   *
   * Fires a _Message Update_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
   */
  editOriginalInteractionResponse: (token: string, options: InteractionCallbackData) => Promise<Camelize<DiscordMessage> | undefined>
  /**
   * Edits the original webhook message.
   *
   * @param webhookId - The ID of the webhook to edit the original message of.
   * @param token - The webhook token, used to edit the message.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link DiscordMessage}.
   *
   * @remarks
   * Fires a _Message Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  editOriginalWebhookMessage: (
    webhookId: BigString,
    token: string,
    options: InteractionCallbackData & { threadId?: BigString },
  ) => Promise<Camelize<DiscordMessage>>
  /**
   * Edits the voice state of the bot user.
   *
   * @param guildId - The ID of the guild in which to edit the voice state of the bot user.
   * @param options - The parameters for the edit of the voice state.
   *
   * @remarks
   * The {@link EditOwnVoiceState.channelId | channelId} property of the {@link options} object parameter must point to a stage channel, and the bot user must already have joined it.
   *
   * If attempting to unmute oneself:
   * - Requires the `MUTE_MEMBERS` permission.
   *
   * If attempting to request to speak:
   * - Requires the `REQUEST_TO_SPEAK` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state}
   */
  editOwnVoiceState: (guildId: BigString, options: EditOwnVoiceState) => Promise<void>
  /**
   * Edits a role in a guild.
   *
   * @param guildId - The ID of the guild to edit the role in.
   * @param roleId - The ID of the role to edit.
   * @param options - The parameters for the edit of the role.
   * @returns An instance of the edited {@link DiscordRole}.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Role Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   */
  editRole: (guildId: BigString, roleId: BigString, options: EditGuildRole) => Promise<Camelize<DiscordRole>>
  /**
   * Edits the positions of a set of roles.
   *
   * @param guildId - The ID of the guild to edit the role positions in.
   * @param options - The parameters for the edit of the role positions.
   * @returns A collection of {@link DiscordRole} objects assorted by role ID.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Role Update_ gateway event for every role impacted in this change.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   */
  editRolePositions: (guildId: BigString, options: ModifyRolePositions[]) => Promise<Camelize<DiscordRole[]>>
  /**
   * Edits a scheduled event.
   *
   * @param guildId - The ID of the guild to edit the scheduled event in.
   * @param eventId - The ID of the scheduled event to edit.
   * @returns An instance of the edited {@link ScheduledEvent}.
   *
   * @remarks
   * Requires the `MANAGE_EVENTS` permission.
   *
   * To start or end an event, modify the event's `status` property.
   *
   * The `entity_metadata` property is discarded for events whose `entity_type` is not {@link ScheduledEventEntityType.External}.
   *
   * Fires a _Guild Scheduled Event Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  editScheduledEvent: (guildId: BigString, eventId: BigString, options: Partial<EditScheduledEvent>) => Promise<Camelize<DiscordScheduledEvent>>
  /**
   * Edits a stage instance.
   *
   * @param channelId - The ID of the stage channel the stage instance is associated with.
   * @returns An instance of the updated {@link DiscordStageInstance}.
   *
   * @remarks
   * Requires the user to be a moderator of the stage channel.
   *
   * Fires a _Stage Instance Update_ event.
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  editStageInstance: (channelId: BigString, data: EditStageInstanceOptions) => Promise<Camelize<DiscordStageInstance>>
  /**
   * Edits the voice state of another user.
   *
   * @param guildId - The ID of the guild in which to edit the voice state of the bot user.
   * @param options - The parameters for the edit of the voice state.
   *
   * @remarks
   * The {@link EditOwnVoiceState.channelId | channelId} property of the {@link options} object parameter must point to a stage channel, and the user must already have joined it.
   *
   * Requires the `MUTE_MEMBERS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state}
   */
  editUserVoiceState: (guildId: BigString, options: EditUserVoiceState) => Promise<void>
  /**
   * Edits a webhook.
   *
   * @param webhookId - The ID of the webhook to edit.
   * @returns An instance of the edited {@link DiscordWebhook}.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * Fires a _Webhooks Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook}
   */
  editWebhook: (webhookId: BigString, options: ModifyWebhook) => Promise<Camelize<DiscordWebhook>>
  /**
   * Edits a webhook message.
   *
   * @param webhookId - The ID of the webhook to edit the message of.
   * @param token - The webhook token, used to edit the message.
   * @param messageId - The ID of the message to edit.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link DiscordMessage}.
   *
   * @remarks
   * Fires a _Message Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  editWebhookMessage: (
    webhookId: BigString,
    token: string,
    messageId: BigString,
    options: InteractionCallbackData & { threadId?: BigString },
  ) => Promise<Camelize<DiscordMessage>>
  /**
   * Edits a webhook using the webhook token, thereby bypassing the need for authentication + permissions.
   *
   * @param webhookId - The ID of the webhook to edit.
   * @param token - The webhook token, used to edit the webhook.
   * @returns An instance of the edited {@link DiscordWebhook}.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * Fires a _Webhooks Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  editWebhookWithToken: (webhookId: BigString, token: string, options: Omit<ModifyWebhook, 'channelId'>) => Promise<Camelize<DiscordWebhook>>
  /**
   * Edits a guild's welcome screen.
   *
   * @param guildId - The ID of the guild to edit the welcome screen of.
   * @param options - The parameters for the edit of the welcome screen.
   * @returns An instance of the edited {@link WelcomeScreen}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  editWelcomeScreen: (guildId: BigString, options: Camelize<DiscordModifyGuildWelcomeScreen>) => Promise<Camelize<DiscordWelcomeScreen>>
  /**
   * Edits the settings of a guild's widget.
   *
   * @param guildId - The ID of the guild to edit the settings of the widget of.
   * @returns An instance of the edited {@link GuildWidgetSettings}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  editWidgetSettings: (guildId: BigString, options: Camelize<DiscordGuildWidgetSettings>) => Promise<Camelize<DiscordGuildWidgetSettings>>
  /**
   * Executes a webhook, causing a message to be posted in the channel configured for the webhook.
   *
   * @param webhookId - The ID of the webhook to execute.
   * @param token - The webhook token, used to execute the webhook.
   * @param options - The parameters for the execution of the webhook.
   * @returns An instance of the created {@link DiscordMessage}, or `undefined` if the {@link ExecuteWebhook.wait | wait} property of the {@link options} object parameter is set to `false`.
   *
   * @remarks
   * If the webhook channel is a forum channel, you must provide a value for either `threadId` or `threadName`.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   */
  executeWebhook: (webhookId: BigString, token: string, options: ExecuteWebhook) => Promise<Camelize<DiscordMessage> | undefined>
  /**
   * Follows an announcement channel, allowing messages posted within it to be cross-posted into the target channel.
   *
   * @param sourceChannelId - The ID of the announcement channel to follow.
   * @param targetChannelId - The ID of the target channel - the channel to cross-post to.
   * @returns An instance of {@link DiscordFollowedChannel}.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission in the __target channel__.
   *
   * Fires a _Webhooks Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#follow-announcement-channel}
   */
  followAnnouncement: (sourceChannelId: BigString, targetChannelId: BigString) => Promise<Camelize<DiscordFollowedChannel>>
  /**
   * Gets the list of all active threads for a guild.
   *
   * @param guildId - The ID of the guild to get the threads of.
   * @returns An instance of {@link DiscordActiveThreads}.
   *
   * @remarks
   * Returns both public and private threads.
   *
   * Threads are ordered by the `id` property in descending order.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   */
  getActiveThreads: (guildId: BigString) => Promise<Camelize<DiscordActiveThreads>>
  /** Get the applications info */
  getApplicationInfo: () => Promise<Camelize<DiscordApplication>>
  /**
   * Gets the permissions of a guild application command.
   *
   * @param guildId - The ID of the guild the command is registered in.
   * @param commandId - The ID of the command to get the permissions of.
   * @returns An instance of {@link ApplicationCommandPermission}.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions}
   */
  getApplicationCommandPermission: (guildId: BigString, commandId: BigString) => Promise<Camelize<DiscordApplicationCommandPermissions>>
  /**
   * Gets the permissions of all application commands registered in a guild by the ID of the guild.
   *
   * @param guildId - The ID of the guild to get the permissions objects of.
   * @returns A collection of {@link ApplicationCommandPermission} objects assorted by command ID.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions}
   */
  getApplicationCommandPermissions: (guildId: BigString) => Promise<Camelize<DiscordApplicationCommandPermissions[]>>
  /**
   * Gets a guild's audit log.
   *
   * @param guildId - The ID of the guild to get the audit log of.
   * @param options - The parameters for the fetching of the audit log.
   * @returns An instance of {@link AuditLog}.
   *
   * @remarks
   * Requires the `VIEW_AUDIT_LOG` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
   */
  getAuditLog: (guildId: BigString, options?: GetGuildAuditLog) => Promise<Camelize<DiscordAuditLog>>
  /**
   * Gets an automod rule by its ID.
   *
   * @param guildId - The ID of the guild to get the rule of.
   * @param ruleId - The ID of the rule to get.
   * @returns An instance of {@link DiscordAutoModerationRule}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutomodRule: (guildId: BigString, ruleId: BigString) => Promise<Camelize<DiscordAutoModerationRule>>
  /**
   * Gets the list of automod rules for a guild.
   *
   * @param guildId - The ID of the guild to get the rules from.
   * @returns A collection of {@link DiscordAutoModerationRule} objects assorted by rule ID.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  getAutomodRules: (guildId: BigString) => Promise<Camelize<DiscordAutoModerationRule[]>>
  /**
   * Gets the list of available voice regions.
   *
   * @returns A collection of {@link VoiceRegions | VoiceRegion} objects assorted by voice region ID.
   */
  getAvailableVoiceRegions: () => Promise<Camelize<DiscordVoiceRegion[]>>
  /**
   * Gets a ban by user ID.
   *
   * @param guildId - The ID of the guild to get the ban from.
   * @param userId - The ID of the user to get the ban for.
   * @returns An instance of {@link DiscordBan}.
   *
   * @remarks
   * Requires the `BAN_MEMBERS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
   */
  getBan: (guildId: BigString, userId: BigString) => Promise<Camelize<DiscordBan>>
  /**
   * Gets the list of bans for a guild.
   *
   * @param guildId - The ID of the guild to get the list of bans for.
   * @param options - The parameters for the fetching of the list of bans.
   * @returns A collection of {@link DiscordBan} objects assorted by user ID.
   *
   * @remarks
   * Requires the `BAN_MEMBERS` permission.
   *
   * Users are ordered by their IDs in _ascending_ order.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   */
  getBans: (guildId: BigString, options?: GetBans) => Promise<Camelize<DiscordBan[]>>
  /**
   * Gets a channel by its ID.
   *
   * @param channelId - The ID of the channel to get.
   * @returns An instance of {@link DiscordChannel}.
   *
   * @remarks
   * If the channel is a thread, a {@link ThreadMember} object is included in the result.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel}
   */
  getChannel: (channelId: BigString) => Promise<Camelize<DiscordChannel>>
  /**
   * Gets the list of invites for a channel.
   *
   * @param channelId - The ID of the channel to get the invites of.
   * @returns A collection of {@link DiscordInviteMetadata} objects assorted by invite code.
   *
   * @remarks
   * Requires the `MANAGE_CHANNELS` permission.
   *
   * Only usable for guild channels.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-invites}
   */
  getChannelInvites: (channelId: BigString) => Promise<Camelize<DiscordInviteMetadata[]>>
  /**
   * Gets the list of channels for a guild.
   *
   * @param guildId - The ID of the guild to get the channels of.
   * @returns A collection of {@link DiscordChannel} objects assorted by channel ID.
   *
   * @remarks
   * Excludes threads.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   */
  getChannels: (guildId: BigString) => Promise<Camelize<DiscordChannel[]>>
  /**
   * Gets a list of webhooks for a channel.
   *
   * @param channelId - The ID of the channel which to get the webhooks of.
   * @returns A collection of {@link DiscordWebhook} objects assorted by webhook ID.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  getChannelWebhooks: (channelId: BigString) => Promise<Camelize<DiscordWebhook[]>>
  /**
   * Gets or creates a DM channel with a user.
   *
   * @param userId - The ID of the user to create the DM channel with.
   * @returns An instance of {@link DiscordChannel}.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  getDmChannel: (userId: BigString) => Promise<Camelize<DiscordChannel>>
  /**
   * Gets an emoji by its ID.
   *
   * @param guildId - The ID of the guild from which to get the emoji.
   * @param emojiId - The ID of the emoji to get.
   * @returns An instance of {@link DiscordEmoji}.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getEmoji: (guildId: BigString, emojiId: BigString) => Promise<Camelize<DiscordEmoji>>
  /**
   * Gets the list of emojis for a guild.
   *
   * @param guildId - The ID of the guild which to get the emojis of.
   * @returns A collection of {@link DiscordEmoji} objects assorted by emoji ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  getEmojis: (guildId: BigString) => Promise<Camelize<DiscordEmoji[]>>
  /**
   * Gets a follow-up message to an interaction by the ID of the message.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @param messageId - The ID of the message to get.
   * @returns An instance of {@link Message}.
   *
   * @remarks
   * Unlike `getMessage()`, this endpoint allows the bot user to act without:
   * - Needing to be able to see the contents of the channel that the message is in. (`READ_MESSAGES` permission.)
   * - Requiring the `MESSAGE_CONTENT` intent.
   *
   * Does not support ephemeral follow-up messages due to these being stateless.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-followup-message}
   */
  getFollowupMessage: (token: string, messageId: BigString) => Promise<Camelize<DiscordMessage>>
  /** Get the bots Gateway metadata that can help during the operation of large or sharded bots. */
  getGatewayBot: () => Promise<Camelize<DiscordGetGatewayBot>>
  /**
   * Gets a global application command by its ID.
   *
   * @param commandId - The ID of the command to get.
   * @returns An instance of {@link ApplicationCommand}.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-command}
   */
  getGlobalApplicationCommand: (commandId: BigString) => Promise<Camelize<DiscordApplicationCommand>>
  /**
   * Gets the list of your bot's global application commands.
   *
   * @returns A collection of {@link ApplicationCommand} objects assorted by command ID.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commands}
   */
  getGlobalApplicationCommands: () => Promise<Camelize<DiscordApplicationCommand[]>>
  /**
   * Gets a guild by its ID.
   *
   * @param guildId - The ID of the guild to get.
   * @param options - The parameters for the fetching of the guild.
   * @returns An instance of {@link Guild}.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
   */
  getGuild: (guildId: BigString, options?: { counts?: boolean }) => Promise<Camelize<DiscordGuild>>
  /**
   * Gets a guild application command by its ID.
   *
   * @param guildId - The ID of the guild the command is registered in.
   * @param commandId - The ID of the command to get.
   * @returns An instance of {@link ApplicationCommand}.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command}
   */
  getGuildApplicationCommand: (commandId: BigString, guildId: BigString) => Promise<Camelize<DiscordApplicationCommand>>
  /**
   * Gets the list of application commands registered by your bot in a guild.
   *
   * @param guildId - The ID of the guild the commands are registered in.
   * @returns A collection of {@link ApplicationCommand} objects assorted by command ID.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#get-global-application-commandss}
   */
  getGuildApplicationCommands: (guildId: BigString) => Promise<Camelize<DiscordApplicationCommand[]>>
  /**
   * Gets the preview of a guild by a guild's ID.
   *
   * @param guildId - The ID of the guild to get the preview of.
   * @returns An instance of {@link GuildPreview}.
   *
   * @remarks
   * If the bot user is not in the guild, the guild must be lurkable.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
   */
  getGuildPreview: (guildId: BigString) => Promise<Camelize<DiscordGuildPreview>>
  /**
   * Returns a sticker object for the given guild and sticker IDs.
   *
   * @param guildId The ID of the guild to get
   * @param stickerId The ID of the sticker to get
   * @return A {@link DiscordSticker}
   *
   * @remarks Includes the user field if the bot has the `MANAGE_EMOJIS_AND_STICKERS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   */
  getGuildSticker: (guildId: BigString, stickerId: BigString) => Promise<Camelize<DiscordSticker>>
  /**
   * Returns an array of sticker objects for the given guild.
   *
   * @param guildId The ID of the guild to get
   * @returns A collection of {@link DiscordSticker} objects assorted by sticker ID.
   *
   * @remarks Includes user fields if the bot has the `MANAGE_EMOJIS_AND_STICKERS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   */
  getGuildStickers: (guildId: BigString) => Promise<Camelize<DiscordSticker[]>>
  /**
   * Gets a template by its code.
   *
   * @param templateCode - The code of the template to get.
   * @returns An instance of {@link Template}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getGuildTemplate: (templateCode: string) => Promise<Camelize<DiscordTemplate>>
  /**
   * Gets the list of templates for a guild.
   *
   * @param guildId - The ID of the guild to get the list of templates for.
   * @returns A collection of {@link Template} objects assorted by template code.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getGuildTemplates: (guildId: BigString) => Promise<Camelize<DiscordTemplate[]>>
  /**
   * Gets the list of webhooks for a guild.
   *
   * @param guildId - The ID of the guild to get the list of webhooks for.
   * @returns A collection of {@link DiscordWebhook} objects assorted by webhook ID.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  getGuildWebhooks: (guildId: BigString) => Promise<Camelize<DiscordWebhook[]>>
  /**
   * Gets the list of integrations attached to a guild.
   *
   * @param guildId - The ID of the guild to get the list of integrations from.
   * @returns A collection of {@link Integration} objects assorted by integration ID.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  getIntegrations: (guildId: BigString) => Promise<Camelize<DiscordIntegration[]>>
  /**
   * Gets an invite to a channel by its invite code.
   *
   * @param inviteCode - The invite code of the invite to get.
   * @param options - The parameters for the fetching of the invite.
   * @returns An instance of {@link DiscordInviteMetadata}.
   *
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite: (inviteCode: string, options?: GetInvite) => Promise<Camelize<DiscordInviteMetadata>>
  /**
   * Gets the list of invites for a guild.
   *
   * @param guildId - The ID of the guild to get the invites from.
   * @returns A collection of {@link InviteMetadata | Invite} objects assorted by invite code.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invites}
   */
  getInvites: (guildId: BigString) => Promise<Camelize<DiscordInviteMetadata[]>>
  /**
   * Gets a message from a channel by the ID of the message.
   *
   * @param channelId - The ID of the channel from which to get the message.
   * @param messageId - The ID of the message to get.
   * @returns An instance of {@link Message}.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel in which the message was posted.
   *
   * If getting a message from a guild channel:
   * - Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-message}
   */
  getMessage: (channelId: BigString, messageId: BigString) => Promise<Camelize<DiscordMessage>>
  /**
   * Gets multiple messages from a channel.
   *
   * @param channelId - The ID of the channel from which to get the messages.
   * @param options - The parameters for the fetching of the messages.
   * @returns A collection of {@link Message} objects assorted by message ID.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel in which the messages were posted.
   *
   * If getting a messages from a guild channel:
   * - Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages: (channelId: BigString, options?: GetMessagesOptions) => Promise<Camelize<DiscordMessage[]>>
  /**
   * Returns the list of sticker packs available to Nitro subscribers.
   *
   * @returns A collection of {@link StickerPack} objects assorted by sticker ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-nitro-sticker-packs}
   */
  getNitroStickerPacks: () => Promise<Camelize<DiscordStickerPack[]>>
  /**
   * Gets the initial message response to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @returns An instance of {@link Message}.
   *
   * @remarks
   * Unlike `getMessage()`, this endpoint allows the bot user to act without:
   * - Needing to be able to see the contents of the channel that the message is in. (`READ_MESSAGES` permission.)
   * - Requiring the `MESSAGE_CONTENT` intent.
   *
   * Does not support ephemeral follow-up messages due to these being stateless.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#get-original-interaction-response}
   */
  getOriginalInteractionResponse: (token: string) => Promise<Camelize<DiscordMessage>>
  /**
   * Gets the pinned messages for a channel.
   *
   * @param channelId - The ID of the channel to get the pinned messages for.
   * @returns A collection of {@link Message} objects assorted by message ID.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel in which the messages were posted.
   *
   * If getting a message from a guild channel:
   * - Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-pinned-messages}
   */
  getPinnedMessages: (channelId: BigString) => Promise<Camelize<DiscordMessage[]>>
  /**
   * Gets the list of private archived threads for a channel.
   *
   * @param channelId - The ID of the channel to get the archived threads for.
   * @param options - The parameters for the fetching of threads.
   * @returns An instance of {@link DiscordArchivedThreads}.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   * Requires the `MANAGE_THREADS` permission.
   *
   * Returns threads of type {@link ChannelTypes.GuildPrivateThread}.
   *
   * Threads are ordered by the `archive_timestamp` property included in the metadata of the object in descending order.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#list-private-archived-threads}
   */
  getPrivateArchivedThreads: (channelId: BigString, options?: ListArchivedThreads) => Promise<Camelize<DiscordArchivedThreads>>
  /**
   * Gets the list of private archived threads the bot is a member of for a channel.
   *
   * @param channelId - The ID of the channel to get the archived threads for.
   * @param options - The parameters for the fetching of threads.
   * @returns An instance of {@link DiscordArchivedThreads}.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * Returns threads of type {@link ChannelTypes.GuildPrivateThread}.
   *
   * Threads are ordered by the `id` property in descending order.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads}
   */
  getPrivateJoinedArchivedThreads: (channelId: BigString, options?: ListArchivedThreads) => Promise<Camelize<DiscordArchivedThreads>>
  /**
   * Gets the number of members that would be kicked from a guild during pruning.
   *
   * @param guildId - The ID of the guild to get the prune count of.
   * @param options - The parameters for the fetching of the prune count.
   * @returns A number indicating the number of members that would be kicked.
   *
   * @remarks
   * Requires the `KICK_MEMBERS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   */
  getPruneCount: (guildId: BigString, options?: GetGuildPruneCountQuery) => Promise<Camelize<DiscordPrunedCount>>
  /**
   * Gets the list of public archived threads for a channel.
   *
   * @param channelId - The ID of the channel to get the archived threads for.
   * @param options - The parameters for the fetching of threads.
   * @returns An instance of {@link ArchivedThreads}.
   *
   * @remarks
   * Requires the `READ_MESSAGE_HISTORY` permission.
   *
   * If called on a channel of type {@link ChannelTypes.GuildText}, returns threads of type {@link ChannelTypes.GuildPublicThread}.
   * If called on a channel of type {@link ChannelTypes.GuildNews}, returns threads of type {@link ChannelTypes.GuildNewsThread}.
   *
   * Threads are ordered by the `archive_timestamp` property included in the metadata of the object in descending order.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads}
   */
  getPublicArchivedThreads: (channelId: BigString, options?: ListArchivedThreads) => Promise<Camelize<DiscordArchivedThreads>>
  /**
   * Gets the list of roles for a guild.
   *
   * @param guildId - The ID of the guild to get the list of roles for.
   * @returns A collection of {@link DisorcRole} objects assorted by role ID.
   *
   * @remarks
   * ⚠️ This endpoint should be used sparingly due to {@link User} objects already being included in guild payloads.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   */
  getRoles: (guildId: BigString) => Promise<Camelize<DiscordRole[]>>
  /**
   * Gets a scheduled event by its ID.
   *
   * @param guildId - The ID of the guild to get the scheduled event from.
   * @param eventId - The ID of the scheduled event to get.
   * @param options - The parameters for the fetching of the scheduled event.
   * @returns An instance of {@link ScheduledEvent}.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  getScheduledEvent: (guildId: BigString, eventId: BigString, options?: { withUserCount?: boolean }) => Promise<Camelize<DiscordScheduledEvent>>
  /**
   * Gets the list of scheduled events for a guild.
   *
   * @param guildId - The ID of the guild to get the scheduled events from.
   * @param options - The parameters for the fetching of the scheduled events.
   * @returns A collection of {@link ScheduledEvent} objects assorted by event ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  getScheduledEvents: (guildId: BigString, options?: GetScheduledEvents) => Promise<Camelize<DiscordScheduledEvent[]>>
  /**
   * Gets the list of subscribers to a scheduled event from a guild.
   *
   * @param guildId - The ID of the guild to get the subscribers to the scheduled event from.
   * @param eventId - The ID of the scheduled event to get the subscribers of.
   * @param options - The parameters for the fetching of the subscribers.
   * @returns A collection of {@link User} objects assorted by user ID.
   *
   * @remarks
   * Requires the `MANAGE_EVENTS` permission.
   *
   * Users are ordered by their IDs in _ascending_ order.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getScheduledEventUsers: (
    guildId: BigString,
    eventId: BigString,
    options?: GetScheduledEventUsers,
  ) => Promise<Array<{ user: Camelize<DiscordUser>; member?: Camelize<DiscordMember> }>>
  /** Get the bots Gateway metadata that can help during the operation of large or sharded bots. */
  getSessionInfo: () => Promise<Camelize<DiscordGetGatewayBot>>
  /**
   * Gets the stage instance associated with a stage channel, if one exists.
   *
   * @param channelId - The ID of the stage channel the stage instance is associated with.
   * @returns An instance of {@link DiscordStageInstance}.
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance: (channelId: BigString) => Promise<Camelize<DiscordStageInstance>>
  /**
   * Returns a sticker object for the given sticker ID.
   *
   * @param stickerId The ID of the sticker to get
   * @returns A {@link DiscordSticker}
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  getSticker: (stickerId: BigString) => Promise<Camelize<DiscordSticker>>
  /**
   * Gets a thread member by their user ID.
   *
   * @param channelId - The ID of the thread to get the thread member of.
   * @param userId - The user ID of the thread member to get.
   * @returns An instance of {@link DiscordThreadMember}.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-thread-member}
   */
  getThreadMember: (channelId: BigString, userId: BigString) => Promise<Camelize<DiscordThreadMember>>
  /**
   * Gets the list of thread members for a thread.
   *
   * @param channelId - The ID of the thread to get the thread members of.
   * @returns A collection of {@link DiscordThreadMember} assorted by user ID.
   *
   * @remarks
   * Requires the application to have the `GUILD_MEMBERS` privileged intent enabled.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members}
   */
  getThreadMembers: (channelId: BigString) => Promise<Camelize<DiscordThreadMember[]>>
  /**
   * Gets the list of users that reacted with an emoji to a message.
   *
   * @param channelId - The ID of the channel the message to get the users for is in.
   * @param messageId - The ID of the message to get the users for.
   * @param reaction - The reaction for which to get the users.
   * @param options - The parameters for the fetching of the users.
   * @returns A collection of {@link User} objects assorted by user ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  getReactions: (channelId: BigString, messageId: BigString, reaction: string, options?: GetReactions) => Promise<Camelize<DiscordUser[]>>
  /**
   * Get a user's data from the api
   *
   * @param id The user's id
   * @returns {Camelize<DiscordUser>}
   */
  getUser: (id: BigString) => Promise<Camelize<DiscordUser>>
  /**
   * Gets information about the vanity url of a guild.
   *
   * @param guildId - The ID of the guild to get the vanity url information for.
   * @returns An instance of {@link VanityUrl}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * The `code` property will be `null` if the guild does not have a set vanity url.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  getVanityUrl: (guildId: BigString) => Promise<Camelize<DiscordVanityUrl>>
  /**
   * Gets the list of voice regions for a guild.
   *
   * @param guildId - The ID of the guild to get the voice regions for.
   * @returns A collection of {@link VoiceRegions | VoiceRegion} objects assorted by voice region ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  getVoiceRegions: (guildId: BigString) => Promise<Camelize<DiscordVoiceRegion[]>>
  /**
   * Gets a webhook by its ID.
   *
   * @param webhookId - The ID of the webhook to get.
   * @returns An instance of {@link DiscordWebhook}.
   *
   * @remarks
   * Requires the `MANAGE_WEBHOOKS` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  getWebhook: (webhookId: BigString) => Promise<Camelize<DiscordWebhook>>
  /**
   * Gets a webhook message by its ID.
   *
   * @param webhookId - The ID of the webhook to get a message of.
   * @param token - The webhook token, used to get webhook messages.
   * @param messageId - the ID of the webhook message to get.
   * @param options - The parameters for the fetching of the message.
   * @returns An instance of {@link DiscordMessage}.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   */
  getWebhookMessage: (
    webhookId: BigString,
    token: string,
    messageId: BigString,
    options?: GetWebhookMessageOptions,
  ) => Promise<Camelize<DiscordMessage>>
  /**
   * Gets a webhook using the webhook token, thereby bypassing the need for authentication + permissions.
   *
   * @param webhookId - The ID of the webhook to get.
   * @param token - The webhook token, used to get the webhook.
   * @returns An instance of {@link DiscordWebhook}.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  getWebhookWithToken: (webhookId: BigString, token: string) => Promise<Camelize<DiscordWebhook>>
  /**
   * Gets the welcome screen for a guild.
   *
   * @param guildId - The ID of the guild to get the welcome screen for.
   * @returns An instance of {@link WelcomeScreen}.
   *
   * @remarks
   * If the welcome screen is not enabled:
   * - Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  getWelcomeScreen: (guildId: BigString) => Promise<Camelize<DiscordWelcomeScreen>>
  /**
   * Gets the guild widget by guild ID.
   *
   * @param guildId - The ID of the guild to get the widget of.
   * @returns An instance of {@link GuildWidget}.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  getWidget: (guildId: BigString) => Promise<Camelize<DiscordGuildWidget>>
  /**
   * Gets the settings of a guild's widget.
   *
   * @param guildId - The ID of the guild to get the widget of.
   * @returns An instance of {@link GuildWidgetSettings}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  getWidgetSettings: (guildId: BigString) => Promise<Camelize<DiscordGuildWidgetSettings>>
  /**
   * Adds the bot user to a thread.
   *
   * @param channelId - The ID of the thread to add the bot user to.
   *
   * @remarks
   * Requires the thread not be archived.
   *
   * Fires a _Thread Members Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#join-thread}
   */
  joinThread: (channelId: BigString) => Promise<void>
  /**
   * Leaves a guild.
   *
   * @param guildId - The ID of the guild to leave.
   *
   * @remarks
   * Fires a _Guild Delete_ event.
   *
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild: (guildId: BigString) => Promise<void>
  /**
   * Removes the bot user from a thread.
   *
   * @param channelId - The ID of the thread to remove the bot user from.
   *
   * @remarks
   * Requires the thread not be archived.
   *
   * Fires a _Thread Members Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#leave-thread}
   */
  leaveThread: (channelId: BigString) => Promise<void>
  /**
   * Cross-posts a message posted in an announcement channel to subscribed channels.
   *
   * @param channelId - The ID of the announcement channel.
   * @param messageId - The ID of the message to cross-post.
   * @returns An instance of the cross-posted {@link Message}.
   *
   * @remarks
   * Requires the `SEND_MESSAGES` permission.
   *
   * If not cross-posting own message:
   * - Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Message Create_ event in the guilds the subscribed channels are in.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#crosspost-message}
   */
  publishMessage: (channelId: BigString, messageId: BigString) => Promise<Camelize<DiscordMessage>>
  /**
   * Removes a role from a member.
   *
   * @param guildId - The ID of the guild the member to remove the role from is in.
   * @param userId - The user ID of the member to remove the role from.
   * @param roleId - The ID of the role to remove from the member.
   *
   * @remarks
   * Requires the `MANAGE_ROLES` permission.
   *
   * Fires a _Guild Member Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
   */
  removeRole: (guildId: BigString, userId: BigString, roleId: BigString, reason?: string) => Promise<void>
  /**
   * Removes a member from a thread.
   *
   * @param channelId - The ID of the thread to remove the thread member of.
   * @param userId - The user ID of the thread member to remove.
   *
   * @remarks
   * If the thread is of type {@link ChannelTypes.GuildPrivateThread}, requires to be the creator of the thread.
   * Otherwise, requires the `MANAGE_THREADS` permission.
   *
   * Requires the thread not be archived.
   *
   * Fires a _Thread Members Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#remove-thread-member}
   */
  removeThreadMember: (channelId: BigString, userId: BigString) => Promise<void>
  /**
   * Sends a message to a channel.
   *
   * @param channelId - The ID of the channel to send the message in.
   * @param options - The parameters for the creation of the message.
   * @returns An instance of the created {@link DiscordMessage}.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel the message is to be sent in.
   *
   * If sending a message to a guild channel:
   * - Requires the `SEND_MESSAGES` permission.
   *
   * If sending a TTS message:
   * - Requires the `SEND_TTS_MESSAGES` permission.
   *
   * If sending a message as a reply to another message:
   * - Requires the `READ_MESSAGE_HISTORY` permission.
   * - The message being replied to cannot be a system message.
   *
   * ⚠️ The maximum size of a request (accounting for any attachments and message content) for bot users is _8 MiB_.
   *
   * Fires a _Message Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  sendMessage: (channelId: BigString, options: CreateMessageOptions) => Promise<Camelize<DiscordMessage>>
  /**
   * Sends a follow-up message to an interaction.
   *
   * @param token - The interaction token to use, provided in the original interaction.
   * @param options - The parameters for the creation of the message.
   * @returns An instance of the created {@link Message}.
   *
   * @remarks
   * ⚠️ Interaction tokens are only valid for _15 minutes_.
   *
   * By default, mentions are suppressed. To enable mentions, pass a mention object with the callback data.
   *
   * Unlike `sendMessage()`, this endpoint allows the bot user to act without:
   * - Needing to be able to see the contents of the channel that the message is in. (`READ_MESSAGES` permission.)
   * - Requiring the `MESSAGE_CONTENT` intent.
   *
   * Fires a _Message Create_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-followup-message}
   */
  sendFollowupMessage: (token: string, options: InteractionCallbackData) => Promise<Camelize<DiscordMessage>>
  /**
   * Sends a response to an interaction.
   *
   * @param interactionId - The ID of the interaction to respond to.
   * @param token - The interaction token to use, provided in the original interaction.
   * @param options - The parameters for the creation of the message.
   * @returns An instance of the created {@link Message}.
   *
   * @remarks
   * ⚠️ Interaction tokens are only valid for _15 minutes_.
   *
   * By default, mentions are suppressed. To enable mentions, pass a mention object with the callback data.
   *
   * Unlike `sendMessage()`, this endpoint allows the bot user to act without:
   * - Needing to be able to see the contents of the channel that the message is in. (`READ_MESSAGES` permission.)
   * - Requiring the `MESSAGE_CONTENT` intent.
   *
   * Fires a _Message Create_ event.
   *
   * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#create-interaction-response}
   */
  sendInteractionResponse: (interactionId: BigString, token: string, options: InteractionResponse) => Promise<void>
  /**
   * Creates a thread, using an existing message as its point of origin.
   *
   * @param channelId - The ID of the channel in which to create the thread.
   * @param messageId - The ID of the message to use as the thread's point of origin.
   * @param options - The parameters to use for the creation of the thread.
   * @returns An instance of the created {@link Channel | Thread}.
   *
   * @remarks
   * If called on a channel of type {@link ChannelTypes.GuildText}, creates a {@link ChannelTypes.GuildPublicThread}.
   * If called on a channel of type {@link ChannelTypes.GuildNews}, creates a {@link ChannelTypes.GuildNewsThread}.
   * Does not work on channels of type {@link ChannelTypes.GuildForum}.
   *
   * The ID of the created thread will be the same as the ID of the source message.
   *
   * Fires a _Thread Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message}
   */
  startThreadWithMessage: (channelId: BigString, messageId: BigString, options: StartThreadWithMessage) => Promise<Camelize<DiscordChannel>>
  /**
   * Creates a thread without using a message as the thread's point of origin.
   *
   * @param channelId - The ID of the channel in which to create the thread.
   * @param options - The parameters to use for the creation of the thread.
   * @returns An instance of the created {@link DiscordChannel | Thread}.
   *
   * @remarks
   * Creating a private thread requires the server to be boosted.
   *
   * Fires a _Thread Create_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message}
   */
  startThreadWithoutMessage: (channelId: BigString, options: StartThreadWithoutMessage) => Promise<Camelize<DiscordChannel>>
  /**
   * Synchronises a template with the current state of a guild.
   *
   * @param guildId - The ID of the guild to synchronise a template of.
   * @returns An instance of the edited {@link Template}.
   *
   * @remarks
   * Requires the `MANAGE_GUILD` permission.
   *
   * Fires a _Guild Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  syncGuildTemplate: (guildId: BigString) => Promise<Camelize<DiscordTemplate>>
  /**
   * Triggers a typing indicator for the bot user.
   *
   * @param channelId - The ID of the channel in which to trigger the typing indicator.
   *
   * @remarks
   * Generally, bots should _not_ use this route.
   *
   * Fires a _Typing Start_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#trigger-typing-indicator}
   */
  triggerTypingIndicator: (channelId: BigString) => Promise<void>
  /**
   * Re-registers the list of global application commands, overwriting the previous commands completely.
   *
   * @param commands - The list of commands to use to overwrite the previous list.
   * @returns A collection of {@link ApplicationCommand} objects assorted by command ID.
   *
   * @remarks
   * ❗ Commands that are not present in the `commands` array will be __deleted__.
   *
   * ⚠️ Commands that do not already exist will count towards the daily limit of _200_ new commands.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands}
   */
  upsertGlobalApplicationCommands: (commands: CreateApplicationCommand[]) => Promise<Camelize<DiscordApplicationCommand[]>>
  /**
   * Re-registers the list of application commands registered in a guild, overwriting the previous commands completely.
   *
   * @param guildId - The ID of the guild whose list of commands to overwrite.
   * @param commands - The list of commands to use to overwrite the previous list.
   * @returns A collection of {@link ApplicationCommand} objects assorted by command ID.
   *
   * @remarks
   * ❗ Commands that are not present in the `commands` array will be __deleted__.
   *
   * ⚠️ Commands that do not already exist will count towards the daily limit of _200_ new commands.
   *
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands}
   */
  upsertGuildApplicationCommands: (guildId: BigString, commands: CreateApplicationCommand[]) => Promise<Camelize<DiscordApplicationCommand[]>>
  /**
   * Bans a user from a guild.
   *
  
   * @param guildId - The ID of the guild to ban the user from.
   * @param userId - The ID of the user to ban from the guild.
   * @param options - The parameters for the creation of the ban.
   *
   * @remarks
   * Requires the `BAN_MEMBERS` permission.
   *
   * Fires a _Guild Ban Add_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   */
  banMember: (guildId: BigString, userId: BigString, options?: CreateGuildBan) => Promise<void>
  /**
   * Edits the nickname of the bot user.
   *
   * @param guildId - The ID of the guild to edit the nickname of the bot user in.
   * @param options - The parameters for the edit of the nickname.
   * @returns An instance of the edited {@link DiscordMember}
   *
   * @remarks
   * Fires a _Guild Member Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
   */
  editBotMember: (guildId: BigString, options: EditBotMemberOptions) => Promise<Camelize<DiscordMember>>
  /**
   * Edits a member's properties.
   *
   * @param guildId - The ID of the guild to edit the member of.
   * @param userId - The user ID of the member to edit.
   * @param options - The parameters for the edit of the user.
   *
   * @remarks
   * This endpoint requires various permissions depending on what is edited about the member.
   * To find out the required permission to enact a change, read the documentation of this endpoint's {@link ModifyGuildMember | parameters}.
   *
   * Fires a _Guild Member Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   */
  editMember: (guildId: BigString, userId: BigString, options: ModifyGuildMember) => Promise<Camelize<DiscordMember>>
  /**
   * Gets the member object by user ID.
   *
  
   * @param guildId - The ID of the guild to get the member object for.
   * @param userId - The ID of the user to get the member object for.
   * @returns An instance of {@link DiscordMemberWithUser}.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  getMember: (guildId: BigString, userId: BigString) => Promise<Camelize<DiscordMemberWithUser>>
  /**
   * Gets the list of members for a guild.
   *
   * @param guildId - The ID of the guild to get the list of members for.
   * @param options - The parameters for the fetching of the members.
   * @returns A collection of {@link DiscordMemberWithUser} objects assorted by user ID.
   *
   * @remarks
   * Requires the `GUILD_MEMBERS` intent.
   *
   * ⚠️ It is not recommended to use this endpoint with very large bots. Instead, opt to use `fetchMembers()`:
   * REST communication only permits 50 requests to be made per second, while gateways allow for up to 120 requests
   * per minute per shard. For more information, read {@link https://discord.com/developers/docs/topics/rate-limits#rate-limits}.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   * @see {@link https://discord.com/developers/docs/topics/gateway#request-guild-members}
   * @see {@link https://discord.com/developers/docs/topics/rate-limits#rate-limits}
   */
  getMembers: (guildId: BigString, options: ListGuildMembers) => Promise<Camelize<DiscordMemberWithUser[]>>

  /**
   * Kicks a member from a guild.
   *
  
   * @param guildId - The ID of the guild to kick the member from.
   * @param userId - The user ID of the member to kick from the guild.
   *
   * @remarks
   * Requires the `KICK_MEMBERS` permission.
   *
   * Fires a _Guild Member Remove_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member}
   */
  kickMember: (guildId: BigString, userId: BigString, reason?: string) => Promise<void>
  /**
   * Pins a message in a channel.
   *
   * @param channelId - The ID of the channel where the message is to be pinned.
   * @param messageId - The ID of the message to pin.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel in which the messages were posted.
   *
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * ⚠️ There can only be at max 50 messages pinned in a channel.
   *
   * Fires a _Channel Pins Update_ event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#pin-message}
   */
  pinMessage: (channelId: BigString, messageId: BigString, reason?: string) => Promise<void>
  /**
   * Initiates the process of pruning inactive members.
   *
  
   * @param guildId - The ID of the guild to prune the members of.
   * @param options - The parameters for the pruning of members.
   * @returns A number indicating how many members were pruned.
   *
   * @remarks
   * Requires the `KICK_MEMBERS` permission.
   *
   * ❗ Requests to this endpoint will time out for large guilds. To prevent this from happening, set the {@link BeginGuildPrune.computePruneCount} property of the {@link options} object parameter to `false`. This will begin the process of pruning, and immediately return `undefined`, rather than wait for the process to complete before returning the actual count of members that have been kicked.
   *
   * ⚠️ By default, this process will not remove members with a role. To include the members who have a _particular subset of roles_, specify the role(s) in the {@link BeginGuildPrune.includeRoles | includeRoles} property of the {@link options} object parameter.
   *
   * Fires a _Guild Member Remove_ gateway event for every member kicked.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   */
  pruneMembers: (guildId: BigString, options: BeginGuildPrune) => Promise<{ pruned: number | null }>
  /**
   * Gets the list of members whose usernames or nicknames start with a provided string.
   *
  
   * @param guildId - The ID of the guild to search in.
   * @param query - The string to match usernames or nicknames against.
   * @param options - The parameters for searching through the members.
   * @returns A collection of {@link DiscordMember} objects assorted by user ID.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   */
  searchMembers: (guildId: BigString, query: string, options?: Omit<SearchMembers, 'query'>) => Promise<Camelize<DiscordMemberWithUser[]>>
  /**
   * Unbans a user from a guild.
   *
  
   * @param guildId - The ID of the guild to unban the user in.
   * @param userId - The ID of the user to unban.
   *
   * @remarks
   * Requires the `BAN_MEMBERS` permission.
   *
   * Fires a _Guild Ban Remove_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-ban}
   */
  unbanMember: (guildId: BigString, userId: BigString) => Promise<void>
  /**
   * Unpins a pinned message in a channel.
   *
   * @param channelId - The ID of the channel where the message is pinned.
   * @param messageId - The ID of the message to unpin.
   *
   * @remarks
   * Requires that the bot user be able to see the contents of the channel in which the messages were posted.
   *
   * Requires the `MANAGE_MESSAGES` permission.
   *
   * Fires a _Channel Pins Update_ event.
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#unpin-message}
   */
  unpinMessage: (channelId: BigString, messageId: BigString, reason?: string) => Promise<void>
}

export type RequestMethods = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'
export type ApiVersions = 9 | 10

export interface CreateWebhook extends WithReason {
  /** Name of the webhook (1-80 characters) */
  name: string
  /** Image url for the default webhook avatar */
  avatar?: string | null
}

export interface CreateRequestBodyOptions {
  headers?: Record<string, string>
  method: RequestMethods
  body?: Record<string, unknown>
  unauthorized?: boolean
  url?: string
}

export interface RequestBody {
  headers: Record<string, string>
  body: string | FormData
  method: RequestMethods
}

export interface SendRequestOptions {
  /** The url to send the request to. */
  url: string
  /** The method to use when sending the request. */
  method: RequestMethods
  /** The body to be sent in the request. */
  body?: Record<string, any>
  /** The amount of times this request has been retried. */
  retryCount: number
  /** Handler to retry a request should it be rate limited. */
  retryRequest?: (options: SendRequestOptions) => Promise<void>
  /** Resolve handler when a request succeeds. */
  resolve: (value: RestRequestResponse) => void
  /** Reject handler when a request fails. */
  reject: (value: RestRequestRejection) => void
  /** If this request has a bucket id which it falls under for rate limit */
  bucketId?: string
  /** Additional request options, used for things like overriding authorization header. */
  options?: Record<string, any>
}

export interface RestRateLimitedPath {
  url: string
  resetTimestamp: number
  bucketId?: string
}

export interface WebhookMessageEditor {
  /**
   * Edits a webhook message.
   *
   * @param webhookId - The ID of the webhook to edit the message of.
   * @param token - The webhook token, used to edit the message.
   * @param messageId - The ID of the message to edit.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link DiscordMessage}.
   *
   * @remarks
   * Fires a _Message Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  (webhookId: BigString, token: string, messageId: BigString, options: InteractionCallbackData & { threadId?: BigString }): Promise<
    Camelize<DiscordMessage>
  >
  /**
   * Edits the original webhook message.
   *
   * @param webhookId - The ID of the webhook to edit the original message of.
   * @param token - The webhook token, used to edit the message.
   * @param options - The parameters for the edit of the message.
   * @returns An instance of the edited {@link DiscordMessage}.
   *
   * @remarks
   * Fires a _Message Update_ gateway event.
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  original: (webhookId: BigString, token: string, options: InteractionCallbackData & { threadId?: BigString }) => Promise<Camelize<DiscordMessage>>
}

export interface RestRequestResponse {
  ok: boolean
  status: number
  body?: string
}

export interface RestRequestRejection {
  ok: boolean
  status: number
  body?: string
  error?: string
}