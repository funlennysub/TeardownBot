import { Member, User } from 'eris'
import IInteractionData from './IInteractionData'
import InteractionType from './InteractionType'

export default interface IInteraction {
  id: string,
  type: InteractionType,
  data: IInteractionData,
  guild_id?: string,
  channel_id?: string,
  member?: Member,
  user?: User,
  token: string,
  version: 1,
}
