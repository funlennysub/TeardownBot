import { Client } from 'eris'
import { join } from 'path'
import ConfigService from './Services/ConfigService'
import MongoService from './Services/MongoService'
import CommandHandler from './Handlers/Commands/CommandHandler'
import Logger from './Utils/Logger'
import FileSystemUtils from './Utils/FileSystem'
import ModuleHandler from './Handlers/Modules/ModuleHandler'
import bot from './index'
import getFiles = FileSystemUtils.getFiles
import logSuccess = Logger.logSuccess

export default class Bot {
  private static instance: Bot
  public client!: Client

  private constructor() {}

  public static initialize(): Bot {
    return Bot.instance || (Bot.instance = new Bot())
  }

  public async start(): Promise<void> {
    this.client = new Client(
      ConfigService.config.bot.token,
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
    await this.loadModules()
    await this.loadCommands()
  }

  private async loadCommands(): Promise<void> {
    for await (const file of getFiles(join(__dirname, './Commands'))) {
      const cmd = await import(file)
      const instance = CommandHandler.register(cmd.default)
      logSuccess(`${instance.data.name} was loaded!`)
    }
    await CommandHandler.updateInfo(ConfigService.config.guild)
  }

  private async loadModules(): Promise<void> {
    for await (const file of getFiles(join(__dirname, './Modules'))) {
      const mdl = await import(file)
      const instance = ModuleHandler.register(mdl.default)
      instance.run(bot.client)
      logSuccess(`${instance.data.name} was loaded!`)
    }
  }
}
