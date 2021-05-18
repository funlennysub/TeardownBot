import CommandUtils from './CommandUtils'
import CommandType from './Types/CommandType'
import ConfigService from '../../Services/ConfigService'
import BaseInteractionCommand from './Types/BaseInteractionCommand'
import BaseTextCommand from './Types/BaseTextCommand'
import deleteGuildCommand = CommandUtils.deleteGuildCommand
import getGuildCommands = CommandUtils.getGuildCommands
import setGuildCommand = CommandUtils.setGuildCommand

export default class CommandHandler {
  public static registeredCommands = new Map<string, BaseInteractionCommand | BaseTextCommand>()

  public static registerAll(commands: Array<{ new(): BaseInteractionCommand | BaseTextCommand }>): void {
    for (const command of commands) this.register(command)
  }

  public static register(command: { new(): BaseInteractionCommand | BaseTextCommand }): BaseTextCommand | BaseInteractionCommand {
    const instance = new command()
    CommandHandler.registeredCommands.set(instance.data.name, instance)
    return instance
  }

  public static getByName(name: string): BaseInteractionCommand | BaseTextCommand | undefined {
    return CommandHandler.registeredCommands.get(name)
  }

  public static async updateInfo(guild: string): Promise<void> {
    const discordCommands = await getGuildCommands(guild, ConfigService.config.applicationId)
    const commands = Array.from(CommandHandler.registeredCommands.entries())
      .filter((e) => e[1].type === CommandType.INTERACTION)
    const names = commands.map((e) => e[0])

    for (const command of discordCommands.filter((c) => !names.includes(c.name)))
      await deleteGuildCommand(guild, command.id, ConfigService.config.applicationId)
    for (const [, command] of commands) {
      if (command.type !== CommandType.INTERACTION) continue
      await setGuildCommand(guild, command.data, ConfigService.config.applicationId)
    }
  }
}
