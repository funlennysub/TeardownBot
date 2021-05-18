import ModuleType from './ModuleType'
import { Client } from 'eris'

export default abstract class BaseEventModule {
  readonly type: ModuleType.EVENT = ModuleType.EVENT

  protected constructor(public data: { name: string }) {}

  public abstract run(bot: Client): any
}
