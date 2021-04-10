import Interaction from '../Interactions/Interaction'
import CommandType from '../Interactions/Types/CommandType'
import ICommandData from '../Interactions/Types/ICommandData'
import IInteractionResponse from '../Interactions/Types/IInteractionResponse'

export default abstract class BaseInteractionCommand {
  readonly type: CommandType.INTERACTION = CommandType.INTERACTION

  protected constructor(public data: ICommandData) {}

  public abstract run(
    args: Record<string, any>,
    interaction: Interaction,
  ): void | IInteractionResponse | Promise<void | IInteractionResponse>
}