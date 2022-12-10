import type { RestManager } from '../../restManager.js'
import type { Template } from '../../transformers/template.js'
import type { DiscordTemplate, BigString, DiscordCreateTemplate } from '@discordeno/types'

/**
 * Creates a template from a guild.
 *
 * @param bot - The bot instance to use to make the request.
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
export async function createGuildTemplate (
  rest: RestManager,
  guildId: BigString,
  options: CreateTemplate
): Promise<Template> {
  if (options.name.length < 1 || options.name.length > 100) {
    throw new Error('The name can only be in between 1-100 characters.')
  }

  if (options.description?.length && options.description.length > 120) {
    throw new Error('The description can only be in between 0-120 characters.')
  }

  const result = await rest.runMethod<DiscordTemplate>(
    rest,
    'POST',
    rest.constants.routes.GUILD_TEMPLATES(guildId),
    options as DiscordCreateTemplate
  )

  return rest.transformers.template(rest, result)
}

export interface CreateTemplate {
  /** Name which the template should have */
  name: string
  /** Description of the template */
  description?: string
}
