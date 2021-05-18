import Interaction from '../Interaction'
import CommandType from '../Types/CommandType'
import ICommandData from '../Types/ICommandData'
import IInteractionResponse from '../Types/IInteractionResponse'

export default abstract class BaseInteractionCommand {
  readonly type: CommandType.INTERACTION = CommandType.INTERACTION

  protected constructor(public data: ICommandData) {}

  public abstract run(
    args: Record<string, any>,
    interaction: Interaction,
  ): void | IInteractionResponse | Promise<void | IInteractionResponse>
}
