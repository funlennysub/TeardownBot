import BaseTextCommand from '../Interactions/BaseTextCommand'
import { Message } from 'eris'
import ConfigService from '../Services/ConfigService'
import { inspect } from 'util'
import req from 'petitio'

export default class EvalCommand extends BaseTextCommand {
  constructor() {
    super({
      name: 'eval',
      desc: 'run js code',
    })
  }

  async run(message: Message, args: Array<string>): Promise<void | Message> {
    if (!ConfigService.config.bot.owners.includes(message.author.id)) return

    let raw = message.content
      .slice(ConfigService.config.bot.prefix.length + this.data.name.length + 1)
      .replace(/^\s+/, '')
      .replace(/\s*$/, '')
    if (!raw) return message.channel.createMessage('idk what you want 😐')
    if (!raw.indexOf('```') && !raw.lastIndexOf('```', raw.length - 6)) {
      raw = raw.substr(3, raw.length - 6)
      if (!raw.indexOf('js')) raw = raw.substr(2)
    }

    const tempMessage = await message.channel.createMessage('loading')
    const start = Date.now()

    const baseJs = `const MongoService = require('../Services/MongoService').default;
    const ConfigService = require('../Services/ConfigService').default;
    const bot = message._client;`
    let js = `${baseJs} ${raw}`
    if (js.includes('await')) js = `(async () => { ${js} })()`

    let result
    try {
      result = await eval(js)
    } catch (err) {
      result = err
    }

    const nope = new RegExp(`${ConfigService.config.bot.token}|${ConfigService.config.mongodb.password}`, 'gi')
    result = inspect(result, { depth: 5 }).replace(nope, 'nope')
    const timeSpent = ((Date.now() - start) / 1000).toFixed(3)

    if (result.length > 1900) {
      const res = await req('https://hastebin.cc/documents').json<{ key: string }>()
      await tempMessage.edit(`Message is too long for DiScOrD: https://hastebin.cc/${res.key}.ts\nTook ${timeSpent} seconds.`)
    } else {
      await tempMessage.edit(`\`\`\`ts\n${result}\n\`\`\`\nTook ${timeSpent} seconds.`)
    }
  }
}
