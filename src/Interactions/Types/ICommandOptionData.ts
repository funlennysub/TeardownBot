import CommandOptionType from './CommandOptionType'
import ICommandChoiceData from './ICommandChoiceData'

export default interface ICommandOptionData {
  type: CommandOptionType,
  name: string,
  description: string,
  required?: boolean,
  options?: Array<ICommandOptionData>,
  choices?: Array<ICommandChoiceData>,
}
