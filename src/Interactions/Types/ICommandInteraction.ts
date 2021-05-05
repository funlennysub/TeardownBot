import ICommandInteractionData from './ICommandInteractionData'
import IInteraction from './IInteraction'

export default interface ICommandInteraction extends IInteraction {
  data: ICommandInteractionData,
}
