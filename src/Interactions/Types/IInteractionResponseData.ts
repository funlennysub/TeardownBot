export default interface IInteractionResponseData {
  content?: string;
  tts?: boolean;
  embeds?: any[];
  allowed_mentions?: any;
  /**
   * 64 - ephemeral
   */
  flags?: number;
}
