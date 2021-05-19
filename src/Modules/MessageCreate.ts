import BaseEventModule from '../Handlers/Modules/Types/BaseEventModule'
import { Client, GuildTextableChannel, Message } from 'eris'
import IInteraction from '../Interactions/Types/IInteraction'
import Interaction from '../Interactions/Interaction'
import InteractionType from '../Interactions/Types/InteractionType'
import InteractionResponseType from '../Interactions/Types/InteractionResponseType'
import CommandHandler from '../Handlers/Commands/CommandHandler'
import CommandType from '../Handlers/Commands/Types/CommandType'
import Command from '../Handlers/Commands/Command'
import Logger from '../Utils/Logger'
import logWarn = Logger.logWarn

export default class MessageCreate extends BaseEventModule {
  constructor() {
    super({
      name: 'MessageCreate',
    })
  }

  private async onInteractionCommand(bot: Client, data: IInteraction): Promise<void> {
    const interaction = new Interaction(data, bot)

    if (interaction.data.type === InteractionType.PING) return void (await interaction.respond({ type: InteractionResponseType.PONG }))
    const command = CommandHandler.getByName(interaction.data.data.name.toLowerCase())
    if (!command || command.type !== CommandType.INTERACTION) return

    const response = await command.run(interaction.generateArguments(), interaction)

    if (response && interaction.responded)
      return logWarn(`Interaction response for the command ${command.data.name} was already sent.`)
    if (!response && !interaction.responded) {
      return void (await interaction.respond({
        type: InteractionResponseType.RESPONSE,
      }))
    }
    if (!response) return
    await interaction.respond(response)
  }

  private async onTextCommand(bot: Client, message: Message): Promise<void> {
    const inputCommand = new Command(message, bot)
    const command = CommandHandler.getByName(inputCommand.generateArguments().name)
    if (!command || command.type !== CommandType.TEXT) return

    command.run(message, inputCommand.generateArguments().arguments)
  }

  run(bot: Client): void {
    bot.on('messageCreate', async (message: Message<GuildTextableChannel>) => {
      const suggestions = ['760130786963095553']

      await this.onTextCommand(bot, message)

      if (
        suggestions.includes(message.channel.id)
        && (message.hasOwnProperty('referencedMessage')
        && message.referencedMessage === null)
      ) {
        await message.addReaction('👍')
        await message.addReaction('👎')
      }
    })

    bot.on('rawWS', (p) => {
      if (p.t === 'INTERACTION_CREATE') {
        const interaction = p.d as IInteraction
        this.onInteractionCommand(bot, interaction)
      }
    })
  }
}
