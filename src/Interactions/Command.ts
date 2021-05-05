import { Client, Message } from 'eris'
import ConfigService from '../Services/ConfigService'

export default class Command {
  public readonly prefix: string

  constructor(public message: Message, private client: Client) {
    this.prefix = ConfigService.config.bot.prefix
  }

  generateArguments(): { name: string, arguments: Array<string> } {
    const args = this.message.content
      .slice(this.prefix.length)
      .trim()
      .split(/ +/)
    const cmd = args.shift()!.toLowerCase()
    return { name: cmd, arguments: args }
  }
}
