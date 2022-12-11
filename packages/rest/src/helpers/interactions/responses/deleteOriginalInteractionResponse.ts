import type { RestManager } from '../../../restManager.js'

/**
 * Deletes the initial message response to an interaction.
 *
 * @param rest - The rest manager to use to make the request.
 * @param token - The interaction token to use, provided in the original interaction.
 *
 * @remarks
 * Unlike `deleteMessage()`, this endpoint allows the bot user to act without needing to see the channel the message is in.
 *
 * Fires a _Message Delete_ event.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#delete-original-interaction-response}
 */
export async function deleteOriginalInteractionResponse (
  rest: RestManager,
  token: string
): Promise<void> {
  return await rest.runMethod<void>(
    rest,
    'DELETE',
    rest.constants.routes.INTERACTION_ORIGINAL_ID_TOKEN(
      rest.applicationId,
      token
    )
  )
}
