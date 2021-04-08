import { Client } from 'eris'
import { config } from 'dotenv'
import Logger from './Logger/Logger'
import { MongoClient } from 'mongodb'
import IInteraction from './Interactions/Types/IInteraction'
import Interaction from './Interactions/Interaction'
import ConfigService from './Services/ConfigService'
import CommandHandler from './CommandHandler'
import InteractionType from './Interactions/Types/InteractionType'
import InteractionResponseType from './Interactions/Types/InteractionResponseType'
import CommandType from './Interactions/Types/CommandType'
import { readdirSync } from 'fs'

import { basename, join } from 'path'


config()

export default class Bot {
  public static token = process.env.bot_token!
  private static instance: Bot
  private commandHandler!: CommandHandler
  private client!: Client
  private logger!: Logger

  private constructor() {}

  public static initialize = (): Bot => {
    return Bot.instance || (Bot.instance = new Bot())
  }

  public start = (): void => {
    this.logger = new Logger()
    this.commandHandler = new CommandHandler()
    this.client = new Client(
      process.env.bot_token!,
      {
        intents: [
          'guilds',
          'guildMembers',
          'guildMessages',
          'guildIntegrations',
          'guildMessageReactions',
        ],
        getAllUsers: true,
        allowedMentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    )
    this.loadCommands()
    this.client.connect().then(() => this.logger.logSuccess('Bot ready'))
    this.initializeMongo()
    this.client.on('rawWS', (p, id) => {
      if (p.t === 'INTERACTION_CREATE') {
        const interaction = p.d as IInteraction
        this.onInteraction(interaction)
      }
    })
  }

  private loadCommands = async (): Promise<void> => {
    let files = readdirSync(join(__dirname, './commands')).map((file) => basename(file, '.js'))
    for (const file of files) {
      const cmd = await import(`./commands/${ file }`)
      this.commandHandler.register(cmd.default)
      this.logger.logSuccess(`${ file } was loaded!`)
    }
    await this.commandHandler.updateInfo(ConfigService.config.guild)
  }

  private onInteraction = async (data: IInteraction): Promise<void> => {
    const interaction = new Interaction(data, this.client)

    if (interaction.data.type === InteractionType.PING) return void (await interaction.respond({ type: InteractionResponseType.PONG }))
    const command = this.commandHandler.getByName(interaction.data.data.name.toLowerCase())
    if (!command || command.type !== CommandType.INTERACTION) return

    const response = await command.run(interaction.generateArguments(), interaction)

    if (response && interaction.responded)
      return this.logger.logWarn(`Interaction response for the command ${ command.data.name } was already sent.`)
    if (!response && !interaction.responded) {
      return void (await interaction.respond({
        type: InteractionResponseType.NO_INPUT,
      }))
    }
    if (!response) return
    await interaction.respond(response)

  }

  private initializeMongo = (): void => {
    MongoClient.connect(ConfigService.config.mongodb.uri, { useUnifiedTopology: true })
      .then((mongo_client) => {
        this.client.mongodb = mongo_client.db(ConfigService.config.mongodb.base_col)
        this.logger.logSuccess('Connected to mongodb')
      })
  }


}