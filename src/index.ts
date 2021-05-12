import Bot from './Bot'
import { GuildTextableChannel, Message } from 'eris'

const bot = Bot.initialize()
bot.start()

// todo: module handler
bot.client.on('messageCreate', async (msg: Message<GuildTextableChannel>) => {
  const suggestions = ['760130786963095553']
  
  if (suggestions.includes(msg.channel.id) && (msg.hasOwnProperty('referencedMessage') && msg.referencedMessage === null)) {
    await msg.addReaction('👍')
    await msg.addReaction('👎')
  }
})

bot.client.on('error', () => {
 // do nothing
})

export default bot
