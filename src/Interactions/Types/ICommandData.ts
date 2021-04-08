import ICommandOptionData from './ICommandOptionData'

export default interface ICommandData {
  name: string;
  description: string;
  options: ICommandOptionData[];
}
