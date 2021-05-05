import { AllowedMentions, Embed } from 'eris'

export default interface IInteractionFollowUp {
  tts?: boolean,
  allowed_mentions?: AllowedMentions,
  embeds?: Array<Embed>,
  file?: string,
  flags?: number,
}
