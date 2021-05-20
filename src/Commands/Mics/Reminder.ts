import Interaction from '../../Interactions/Interaction'
import IInteractionResponse from '../../Interactions/Types/IInteractionResponse'
import { AllowedMentions, EmbedOptions, GuildTextableChannel } from 'eris'
import BaseInteractionCommand from '../../Handlers/Commands/Types/BaseInteractionCommand'
import CommandOptionType from '../../Interactions/Types/CommandOptionType'
import { Reminder } from '../../Types/Reminders'
import MongoService from '../../Services/MongoService'
import { Collection, FilterQuery } from 'mongodb'
import DiscordUtils from '../../Utils/Discord'
import InteractionResponseType from '../../Interactions/Types/InteractionResponseType'
import InteractionResponseFlags from '../../Interactions/Types/InteractionResponseFlags'
import Reminders from '../../Modules/Reminders'
import isTextChannel = DiscordUtils.isTextChannel
import hasChannelAccess = DiscordUtils.hasChannelAccess
import convertTimeToMs = DiscordUtils.convertTimeToMs

type SetReminder = { _: ['reminder', 'set'], channel: string, time: string, text: string }
type WithId = { _: ['reminder', 'info' | 'delete'], id: number }
type ListReminders = { _: ['reminder', 'show'], type: 'all' }
type Args = SetReminder | WithId | ListReminders

const allowedMentions: AllowedMentions = { users: false, roles: false, everyone: false, repliedUser: false }

export default class ReminderCommand extends BaseInteractionCommand {
  private allowedChannels: Array<string>
  private reminders: Collection<Reminder>

  constructor() {
    super({
      name: 'reminder',
      description: 'Reminder',
      options: [
        {
          name: 'set',
          description: 'Set a reminder',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'channel',
              description: 'The channel to which the reminder will be sent',
              type: CommandOptionType.CHANNEL,
              required: true,
            },
            {
              name: 'time',
              description: 'Time after which to send a reminder. Format :: 1y6mo2w1d50m',
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: 'text',
              description: 'Text to send',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'info',
          description: 'Get reminder info',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'id',
              description: 'Reminder ID',
              type: CommandOptionType.INTEGER,
              required: true,
            },
          ],
        },
        {
          name: 'delete',
          description: 'Delete specific reminder',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'id',
              description: 'Reminder ID',
              type: CommandOptionType.INTEGER,
              required: true,
            },
          ],
        },
        {
          name: 'show',
          description: 'Show all your current reminders',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'type',
              description: 'make discord happy',
              type: CommandOptionType.STRING,
              required: true,
              choices: [{ name: 'all_c', value: 'all' }],
            },
          ],
        },
      ],
    })

    this.allowedChannels = ['806440595891290142', '768940642767208468', '780106606456733727']
    this.reminders = MongoService.getCollection<Reminder>('reminders')
  }

  async run(args: Args, interaction: Interaction): Promise<IInteractionResponse | void> {
    const action = args._[1]
    if (!this.allowedChannels.includes(interaction.data.channel_id!))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Commands are not allowed in this channel. Allowed channels: ${this.allowedChannels.map((ch) => `<#${ch}>`).join(', ')}`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    switch (action) {
      case 'set':
        return await this.setReminderExec(<SetReminder>args, interaction)
      case 'delete':
        return this.deleteReminderExec(<WithId>args, interaction)
      case 'info':
        return this.infoReminderExec(<WithId>args, interaction)
      case 'show':
        return this.showAllRemindersExec(<ListReminders>args, interaction)
    }
  }

  async setReminderExec(args: SetReminder, interaction: Interaction): Promise<IInteractionResponse | void> {
    const { _, channel, text, time } = args

    const guild = await interaction.getGuild()
    const member = (await interaction.getMember(guild))!
    const rChannel = guild?.channels.get(channel)!

    if ((await this.reminders.find({ userId: member.id }).toArray()).length === 25)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: 'Sorry, but you can\'t have more than 25 reminders because im lazy to make pages. :(',
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    if (!isTextChannel(rChannel))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: 'Channel you entered is not a text channel.',
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    if (!hasChannelAccess(<GuildTextableChannel>rChannel, member))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: 'You don\'t have permissions to send messages in that channel.',
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const rTime = convertTimeToMs(time)
    if (rTime === null)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: 'Invalid time format. Please use :: `1y 2mo 3w 4d 5h 6m 7s` or `1y2mo3w4d5h6m7s`',
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    Reminders.setReminder(member.id, text, channel, guild?.id!, rTime)
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Reminder set! You'll get notified on \`${new Date(Date.now() + rTime).toUTCString()}\``,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  async deleteReminderExec(args: WithId, interaction: Interaction): Promise<IInteractionResponse | void> {
    const { _, id } = args

    const filter: FilterQuery<Reminder> = { id, userId: interaction.data.member?.user.id }
    const reminder = await this.reminders.findOne(filter)
    if (reminder === null)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Reminder with ID \`${id}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    await this.reminders.deleteOne(filter)
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: 'Reminder has been successfully deleted!',
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  async infoReminderExec(args: WithId, interaction: Interaction): Promise<IInteractionResponse | void> {
    const { _, id } = args

    const filter: FilterQuery<Reminder> = { id, userId: interaction.data.member?.user.id }
    const reminder = await this.reminders.findOne(filter)
    if (reminder === null)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Reminder with ID \`${id}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const embed: EmbedOptions = {
      title: `Reminder info`,
      description: reminder.text,
      fields: [
        { name: 'Reminder Channel', value: `<#${reminder.channel}>`, inline: true },
        { name: 'Will be reminded on', value: new Date(reminder.time).toUTCString(), inline: true },
      ],
    }

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        embeds: [embed],
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  async showAllRemindersExec(args: ListReminders, interaction: Interaction): Promise<IInteractionResponse | void> {
    const { _, type } = args

    const reminders = await this.reminders.find({ userId: interaction.data.member?.user.id }).toArray()

    const embed: EmbedOptions = {
      title: 'All your reminders',
      fields: reminders.map((reminder) => ({
        name: `ID: ${reminder.id}`,
        value: reminder.text,
        inline: true,
      })),
    }

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        embeds: [embed],
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }
}
