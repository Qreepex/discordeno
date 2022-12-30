import type {
  DiscordApplicationCommandOptionChoice,
  Optionalize
} from '@discordeno/types'
import type { Client } from '../client.js'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function transformApplicationCommandOptionChoice (
  client: Client,
  payload: DiscordApplicationCommandOptionChoice
) {
  const applicationCommandChoice = {
    name: payload.name,
    nameLocalizations: payload.name_localizations ?? undefined,
    value: payload.value
  }

  return applicationCommandChoice as Optionalize<
    typeof applicationCommandChoice
  >
}

export interface ApplicationCommandOptionChoice
  extends ReturnType<typeof transformApplicationCommandOptionChoice> {}