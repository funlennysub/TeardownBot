import ICommandData from './Interactions/types/ICommandData'
import CommandType from './Interactions/types/CommandType'
import Interaction from './Interactions/Interaction'
import IInteractionResponse from './Interactions/types/IInteractionResponse'

export default abstract class BaseInteractionCommand {
  readonly type: CommandType.INTERACTION = CommandType.INTERACTION

  protected constructor(public data: ICommandData) {}

  public abstract run(
    args: Record<string, any>,
    interaction: Interaction,
  ): void | IInteractionResponse | Promise<void | IInteractionResponse>;
}