import InteractionType from './InteractionType'
import IInteractionData from './IInteractionData'

export default interface IInteraction {
  id: string;
  type: InteractionType;
  data: IInteractionData;
  guild_id?: string;
  channel_id?: string;
  member: any;
  user: any;
  token: string;
  version: 1;
}
