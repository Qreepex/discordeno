import { ChannelTypes } from '../../mod.js'
import { assertEquals, assertExists } from '../deps.js'
import { loadBot } from '../mod.js'
import { CACHED_COMMUNITY_GUILD_ID } from '../utils.js'

Deno.test({
  name: '[channel] create a new text channel',
  ignore: process.env.TEST_ENV === 'UNIT',
  async fn(t) {
    const bot = loadBot()
    const channel = await bot.helpers.createChannel(CACHED_COMMUNITY_GUILD_ID, { name: 'Discordeno-test' })

    // Assertions
    assertExists(channel)
    assertEquals(channel.type, ChannelTypes.GuildText)
    assertEquals(channel.topic, undefined)
    assertEquals(channel.bitrate, undefined)
    assertEquals(channel.userLimit, undefined)
    assertEquals(channel.rateLimitPerUser, 0)
    assertEquals(channel.nsfw, false)
    assertEquals(channel.permissionOverwrites.length, 0)

    // Delete the channel once test is done
    await bot.helpers.deleteChannel(channel.id)
  }
})