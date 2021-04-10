import CommandUtils from '../Interactions/CommandUtils'
import CommandType from '../Interactions/Types/CommandType'
import ConfigService from '../Services/ConfigService'
import BaseInteractionCommand from '../Types/BaseInteractionCommand'
import deleteGuildCommand = CommandUtils.deleteGuildCommand
import getGuildCommands = CommandUtils.getGuildCommands
import setGuildCommand = CommandUtils.setGuildCommand

export default class CommandHandler {
  private registeredCommands = new Map<string, BaseInteractionCommand>()

  registerAll(commands: { new(): BaseInteractionCommand }[]): void {
    for (const command of commands) this.register(command)
  }

  register(command: { new(): BaseInteractionCommand }): void {
    const instance = new command()
    this.registeredCommands.set(instance.data.name, instance)
  }

  getByName(name: string): BaseInteractionCommand | undefined {
    return this.registeredCommands.get(name)
  }

  async updateInfo(guild: string): Promise<void> {
    const discordCommands = await getGuildCommands(guild, ConfigService.config.applicationId)
    const commands = Array.from(this.registeredCommands.entries()).filter((e) => e[1].type === CommandType.INTERACTION)
    const names = commands.map((e) => e[0])
    for (const command of discordCommands.filter((c) => !names.includes(c.name)))
      await deleteGuildCommand(guild, command.id, ConfigService.config.applicationId)
    for (const [, command] of commands) {
      if (command.type !== CommandType.INTERACTION) continue
      await setGuildCommand(guild, command.data, ConfigService.config.applicationId)
    }
  }
}