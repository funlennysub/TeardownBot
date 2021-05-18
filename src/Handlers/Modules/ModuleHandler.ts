import BaseEventModule from './Types/BaseEventModule'

export default class ModuleHandler {
  public static registeredModules = new Map<string, BaseEventModule>()

  public static registerAll(modules: Array<{ new(): BaseEventModule }>): void {
    for (const module of modules) this.register(module)
  }

  public static register(module: { new(): BaseEventModule }): BaseEventModule {
    const instance = new module()
    ModuleHandler.registeredModules.set(instance.data.name, instance)
    return instance
  }
}
