import { Client } from 'eris'
import { config } from 'dotenv'
import Logger from './Logger/Logger'
import { MongoClient } from 'mongodb'

config()

class Bot {
  public static botConfig = require('../config.json')
  public static owners: Array<string> = [...Bot.botConfig.bot.owners]
  private static instance: Bot
  public bot!: Client
  private logger!: Logger

  private constructor() {}

  public static buildBot(): Bot {
    return Bot.instance || (Bot.instance = new Bot())
  }

  public start(): void {
    this.logger = new Logger()
    this.bot = new Client(
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

    this.bot.connect().then(() => this.logger.logSuccess('Bot ready'))
    this.initializeMongo()
  }

  private initializeMongo(): void {
    MongoClient.connect(Bot.botConfig.mongodb.uri, { useUnifiedTopology: true })
      .then((mongo_client) => {
        this.bot.mongodb = mongo_client.db(Bot.botConfig.mongodb.base_col)
        this.logger.logSuccess('Connected to mongodb')
      })
  }

}