import { AllowedMentions } from 'eris'

export default interface IInteractionResponseData {
  content?: string,
  tts?: boolean,
  embeds?: Array<any>,
  allowed_mentions?: AllowedMentions,
  /**
   * 64 - ephemeral
   */
  flags?: number,
}
