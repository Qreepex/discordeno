import type { BigString } from '@discordeno/types'
import type { RestManager } from '../../../restManager.js'

/**
 * Deletes a follow-up message to an interaction.
 *
 * @param rest - The rest manager to use to make the request.
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
export async function deleteFollowupMessage (
  rest: RestManager,
  token: string,
  messageId: BigString
): Promise<void> {
  return await rest.runMethod<void>(
    rest,
    'DELETE',
    rest.constants.routes.INTERACTION_ID_TOKEN_MESSAGE_ID(
      rest.applicationId,
      token,
      messageId
    )
  )
}
