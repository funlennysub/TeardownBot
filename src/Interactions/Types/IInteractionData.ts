import IInteractionDataOption from './IInteractionDataOption'

export default interface IInteractionData {
  id: string,
  name: string,
  options?: Array<IInteractionDataOption>,
}
