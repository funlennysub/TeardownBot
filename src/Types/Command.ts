import ICommandData from '../Interactions/Types/ICommandData'

export interface Command {
  data: ICommandData
  run: () => any
}
