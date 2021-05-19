import BaseEventModule from '../Handlers/Modules/Types/BaseEventModule'
import { Client, GuildTextableChannel } from 'eris'
import MongoService from '../Services/MongoService'
import { Reminder } from '../Types/Reminders'
import cron from 'node-cron'
import DiscordUtils from '../Utils/Discord'
import clearMessage = DiscordUtils.clearMessage

export default class Reminders extends BaseEventModule {
  constructor() {
    super({
      name: 'Reminders',
    })
  }

  public static setReminder(userId: string, text: string, channel: string, guild: string, time: number) {
    const id = Math.floor(Math.random() * 2824)
    MongoService.getCollection<Reminder>('reminders').insertOne({ id, userId, text, channel, guild, time: Date.now() + time })
  }

  sendReminder(bot: Client, userId: string, text: string, channel: string, guild: string) {
    const rGuild = bot.guilds.get(guild)!
    const rChannel = rGuild.channels.get(channel)

    if (rChannel === undefined) return

    (rChannel as GuildTextableChannel).createMessage({
      content: `<@${userId}>, ${clearMessage(text, rGuild)}`,
      allowedMentions: { users: true, roles: false, everyone: false, repliedUser: false },
    })
  }

  private processReminders(bot: Client): void {
    const reminders = MongoService.getCollection<Reminder>('reminders')

    reminders.find().forEach((reminder) => {
      if (reminder.time < Date.now()) {
        const guild = bot.guilds.get(reminder.guild)!
        this.sendReminder(bot, reminder.userId, reminder.text, reminder.channel, reminder.guild)

        reminders.deleteOne(reminder)
      }
    })
  }

  run(bot: Client): void {
    cron.schedule('*/10 * * * * *', () => this.processReminders(bot))
  }
}
