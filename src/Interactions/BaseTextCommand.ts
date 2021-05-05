import CommandType from './Types/CommandType'
import { Message } from 'eris'

export default abstract class BaseTextCommand {
  readonly type: CommandType.TEXT = CommandType.TEXT

  protected constructor(public data: { name: string, desc: string }) {}

  public abstract run(message: Message, args: Array<string>): void | Message | Promise<void | Message>
}
