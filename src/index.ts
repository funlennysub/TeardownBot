import { Client } from 'eris'
import { config } from 'dotenv'

config()

const bot = new Client(
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
    allowedMentions: { users: false, roles: false, everyone: false, repliedUser: false }
  },
)

