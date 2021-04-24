import { AllowedMentions, EmbedOptions } from 'eris'

export default interface IInteractionResponseData {
  content?: string,
  tts?: boolean,
  embeds?: Array<EmbedOptions>,
  allowed_mentions?: AllowedMentions,
  /**
   * 64 - ephemeral
   */
  flags?: number,
}
