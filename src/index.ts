import Bot from './Bot'

const bot = Bot.initialize()

bot.start()

bot.client.on('error', (err) => {
  console.error(err)
})

export default bot
