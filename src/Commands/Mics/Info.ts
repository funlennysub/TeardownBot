import BaseTextCommand from '../../Handlers/Commands/Types/BaseTextCommand'
import { Message } from 'eris'
import CommandHandler from '../../Handlers/Commands/CommandHandler'
import ConfigService from '../../Services/ConfigService'

export default class InfoCommand extends BaseTextCommand {
  constructor() {
    super({
      name: 'info',
      description: 'some bot info',
    })
  }

  async run(message: Message): Promise<void | Message> {
    const uptime = this.botUptime(message._client.uptime)
    const { slashCommands, defaultCommands } = this.returnCommands()

    const elements = [
      `Uptime: ${uptime}`,
      `Slash Commands (**${slashCommands.length}**): ${slashCommands
        .map((cmd) => `\`/${cmd}\``)
        .join(', ')}`,
      `Default Commands (**${defaultCommands.length}**): ${defaultCommands
        .map((cmd) => `\`${ConfigService.config.bot.prefix}${cmd}\``)
        .join(', ')}`,
      '',
      'GitHub repository: <https://github.com/funlennysub/teardown-bot>',
    ]

    await message.channel.createMessage(elements.join('\n'))
  }

  private botUptime(uptime: number): string {
    let minutes = uptime / 60e3
    let hours = minutes / 60
    let days = hours / 24
    return `${days.toFixed(0)}d ${hours.toFixed(0)}h ${minutes.toFixed(0)}m`
  }

  private returnCommands(): { slashCommands: Array<string>, defaultCommands: Array<string> } {
    const botCommands = CommandHandler.registeredCommands
    const slashCommands = Array.from(botCommands.entries())
      .filter((e) => e[1].type === 0)
      .map((cmd) => cmd[0])
    const defaultCommands = Array.from(botCommands.entries())
      .filter((e) => e[1].type === 1)
      .map((cmd) => cmd[0])
    return { slashCommands, defaultCommands }
  }
}