import BaseTextCommand from '../../Handlers/Commands/Types/BaseTextCommand'
import { Message } from 'eris'
import ConfigService from '../../Services/ConfigService'
import { exec } from 'child_process'
import req from 'petitio'

export default class ExecuteCommand extends BaseTextCommand {
  constructor() {
    super({
      name: 'exec',
      description: 'run code in terminal',
    })
  }

  async run(message: Message): Promise<void | Message> {
    if (!ConfigService.config.bot.owners.includes(message.author.id)) return

    const command = message.content
      .slice(ConfigService.config.bot.prefix.length + this.data.name.length + 1)
      .replace(/^\s+/, '')
      .replace(/\s*$/, '')
    if (!command) return message.channel.createMessage('idk what you want 😐')

    const tempMessage = await message.channel.createMessage('loading')
    const start = Date.now()

    exec(command, async (exception, out, err) => {
      const result = exception ? err : out

      const timeSpent = ((Date.now() - start) / 1000).toFixed(3)

      if (result.length > 1900) {
        const res = await req('https://hastebin.cc/documents').json<{ key: string }>()
        await tempMessage.edit(`Message is too long for DiScOrD: https://hastebin.cc/${res.key}.txt\nTook ${timeSpent} seconds.`)
      } else {
        await tempMessage.edit(`\`\`\`\n${result}\n\`\`\`\nTook ${timeSpent} seconds.`)
      }
    })
  }
}