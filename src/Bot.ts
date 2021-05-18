import { Client, GuildTextableChannel, Message } from 'eris'
import { readdirSync } from 'fs'
import { basename, join } from 'path'
import Interaction from './Interactions/Interaction'
import CommandType from './Interactions/Types/CommandType'
import IInteraction from './Interactions/Types/IInteraction'
import InteractionResponseType from './Interactions/Types/InteractionResponseType'
import InteractionType from './Interactions/Types/InteractionType'
import ConfigService from './Services/ConfigService'
import MongoService from './Services/MongoService'
import CommandHandler from './Interactions/CommandHandler'
import Logger from './Utils/Logger'
import Command from './Interactions/Command'
import logWarn = Logger.logWarn
import logSuccess = Logger.logSuccess

export default class Bot {
  public static token = ConfigService.config.bot.token
  private static instance: Bot
  public client!: Client
  private commandHandler!: CommandHandler

  private constructor() {}

  public static initialize(): Bot {
    return Bot.instance || (Bot.instance = new Bot())
  }

  public async start(): Promise<void> {
    this.commandHandler = new CommandHandler()
    this.client = new Client(
      Bot.token,
      {
        intents: [
          'guilds',
          'guildMembers',
          'guildMessages',
          'guildPresences',
          'directMessages',
          'guildIntegrations',
          'guildMessageReactions',
        ],
        getAllUsers: true,
        allowedMentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    )

    try {
      await MongoService.connect(ConfigService.config.mongodb.uri)
      logSuccess('Connected to mongodb')
    } catch (e) {
      console.error(e)
    }

    await this.client.connect().then(() => logSuccess('Bot ready'))
    await this.loadCommands()

    this.client.on('rawWS', (p) => {
      if (p.t === 'INTERACTION_CREATE') {
        const interaction = p.d as IInteraction
        this.onInteractionCommand(interaction)
      }
    })
    this.client.on('messageCreate', async (message: Message<GuildTextableChannel>) => {
      await this.onTextCommand(message)
    })
  }

  private async loadCommands(): Promise<void> {
    let files = readdirSync(join(__dirname, './Commands')).map((file) => basename(file, '.js'))
    for (const file of files) {
      const cmd = await import(`./Commands/${file}`)
      this.commandHandler.register(cmd.default)
      logSuccess(`${file} was loaded!`)
    }
    await this.commandHandler.updateInfo(ConfigService.config.guild)
  }

  private async onInteractionCommand(data: IInteraction): Promise<void> {
    const interaction = new Interaction(data, this.client)

    if (interaction.data.type === InteractionType.PING) return void (await interaction.respond({ type: InteractionResponseType.PONG }))
    const command = this.commandHandler.getByName(interaction.data.data.name.toLowerCase())
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

  private async onTextCommand(message: Message): Promise<void> {
    const inputCommand = new Command(message, this.client)
    const command = this.commandHandler.getByName(inputCommand.generateArguments().name)
    if (!command || command.type !== CommandType.TEXT) return

    command.run(message, inputCommand.generateArguments().arguments)
  }
}
