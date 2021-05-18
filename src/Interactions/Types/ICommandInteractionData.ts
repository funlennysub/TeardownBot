import IInteractionDataOption from './IInteractionDataOption'

export default interface ICommandInteractionData {
  id: string,
  name: string,
  options?: Array<IInteractionDataOption>,
}
