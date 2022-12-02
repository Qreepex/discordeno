import {
  BigString,
  Bot,
  Collection,
  CreateMessage,
  Message
} from '@discordeno/bot'

/** Maps the <userId, channelId> for dm channels */
export const dmChannelIds = new Collection<BigString, BigString>()

/** Sends a direct message to a user. This can take two API calls. The first call is to create a dm channel. Then sending the message to that channel. Channel ids are cached as needed to prevent duplicate requests. */
export async function sendDirectMessage (
  bot: Bot,
  userId: BigString,
  content: string | CreateMessage
): Promise<Message> {
  if (typeof content === 'string') content = { content }

  // GET CHANNEL ID FROM CACHE OR CREATE THE CHANNEL FOR THIS USER
  const cachedChannelId = dmChannelIds.get(userId)
  // IF ID IS CACHED SEND MESSAGE DIRECTLY
  if (cachedChannelId) { return await bot.helpers.sendMessage(cachedChannelId, content) }

  // CREATE A NEW DM CHANNEL AND PLUCK ITS ID
  const channel = await bot.helpers.getDmChannel(userId)

  // CACHE IT FOR FUTURE REQUESTS
  dmChannelIds.set(userId, channel.id)

  // CACHE CHANNEL IF NEEDED
  return await bot.helpers.sendMessage(channel.id, content)
}