import { eventHandlers } from "../../bot.ts";
import { cacheHandlers } from "../../cache.ts";
import { DiscordGatewayPayload } from "../../types/gateway/gateway_payload.ts";
import {
  MessageReactionRemove,
} from "../../types/messages/message_reaction_remove.ts";

export async function handleMessageReactionRemove(
  data: DiscordGatewayPayload,
) {
  const payload = data.d as MessageReactionRemove;
  const message = await cacheHandlers.get("messages", payload.messageId);

  if (message) {
    const reaction = message.reactions?.find((reaction) =>
      // MUST USE == because discord sends null and we use undefined
      reaction.emoji.id == payload.emoji.id &&
      reaction.emoji.name === payload.emoji.name
    );

    if (reaction) {
      reaction.count--;
      if (reaction.count === 0) {
        message.reactions = message.reactions?.filter((r) => r.count !== 0);
      }
      if (!message.reactions?.length) message.reactions = undefined;

      await cacheHandlers.set("messages", payload.messageId, message);
    }
  }

  eventHandlers.reactionRemove?.(
    payload,
    message,
  );
}
