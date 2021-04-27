import { Collection } from 'mongodb'
import Interaction from '../Interactions/Interaction'
import CommandOptionType from '../Interactions/Types/CommandOptionType'
import IInteractionResponse from '../Interactions/Types/IInteractionResponse'
import InteractionResponseFlags from '../Interactions/Types/InteractionResponseFlags'
import InteractionResponseType from '../Interactions/Types/InteractionResponseType'
import ConfigService from '../Services/ConfigService'
import MongoService from '../Services/MongoService'
import BaseInteractionCommand from '../Types/BaseInteractionCommand'
import { QueuedTag, Tag } from '../Types/Tags'
import Discord from '../Utils/Discord'
import TagUtils from '../Utils/TagUtils'
import formatUser = Discord.formatUser

type Args = { _: Array<string>, name: string, value?: string }

export default class TagsCommand extends BaseInteractionCommand {
  private ALLOWED_CHANNELS: Array<string>
  private QUEUE_CHANNEL: string
  private TAGS: Collection<Tag>
  private QUEUED_TAGS: Collection<QueuedTag>

  constructor() {
    super({
      name: 'tag',
      description: 'Portable FAQ',
      options: [
        {
          name: 'use',
          description: 'Use an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'info',
          description: 'Show info of an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'list',
          description: 'List all tags',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'value',
              description: 'List queued or existing tags',
              type: CommandOptionType.STRING,
              required: true,
              choices: [
                { name: 'queue', value: 'queue' },
                { name: 'existing', value: 'existing' },
              ],
            },
          ],
        },
        {
          name: 'add',
          description: 'Create new tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: 'value',
              description: 'Tag description',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'delete',
          description: 'Delete an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'public',
          description: 'Change the publicity of an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: 'value',
              description: 'Make public or private',
              type: CommandOptionType.STRING,
              required: true,
              choices: [
                {
                  name: 'public',
                  value: 'true',
                },
                {
                  name: 'private',
                  value: 'false',
                },
              ],
            },
          ],
        },
        {
          name: 'rename',
          description: 'Change the name of an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: 'value',
              description: 'New tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'edit',
          description: 'Change the description of an existing tag',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Tag name',
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: 'value',
              description: 'New tag description',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'approve',
          description: 'Approve any tag from a queue',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Action ID from a queue channel',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
        {
          name: 'decline',
          description: 'Decline any tag from a queue',
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'name',
              description: 'Action ID from a queue channel',
              type: CommandOptionType.STRING,
              required: true,
            },
          ],
        },
      ],
    })

    this.ALLOWED_CHANNELS = ['780106606456733727', '768940642767208468', '806440595891290142']

    this.QUEUE_CHANNEL = ConfigService.config.queueChannel
    this.TAGS = MongoService.getCollection<Tag>(ConfigService.config.mongodb.tagsCollection)
    this.QUEUED_TAGS = MongoService.getCollection<QueuedTag>(ConfigService.config.mongodb.queueCollection)
  }

  run = async (args: Args, interaction: Interaction): Promise<IInteractionResponse | void> => {
    // 'use' | 'info | 'list' | 'add' | 'delete' | 'public' | 'rename' | 'edit' | 'approve' | 'decline'
    const action = args._[1]
    if (!this.ALLOWED_CHANNELS.includes(interaction.data.channel_id!))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Commands are not allowed in this channel. Allowed channels: ${this.ALLOWED_CHANNELS.map((ch) => `<#${ch}>`).join(', ')}`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }
    switch (action) {
      case 'use':
        return await this.onTagUse(args)
      case 'info':
        return await this.onTagInfo(args, interaction)
      case 'list':
        return await this.onTagList(args)
      case 'add':
        return await this.onTagAdd(args, interaction)
      case 'delete':
        return await this.onTagDelete(args, interaction)
      case 'public':
        return await this.onTagPublic(args, interaction)
      case 'rename':
        return await this.onTagEdit(args, interaction, 'rename')
      case 'edit':
        return await this.onTagEdit(args, interaction, 'edit')
      case 'approve':
        return await this.checkTag(args, interaction, 'approve')
      case 'decline':
        return await this.checkTag(args, interaction, 'decline')
    }
    return void 0
  }

  async onTagUse(args: Args): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }

    await this.TAGS.updateOne({ name }, { $inc: { timeUsed: 1 } })
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: tag[0].content.replace(/\\n/g, '\n'),
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagInfo(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].author_id)!.user
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        embeds: [
          {
            color: 0x80CBC4,
            title: 'Tag info',
            fields: [
              { name: 'Name', value: tag[0].name, inline: true },
              { name: 'Public', value: String(tag[0].public), inline: true },
              { name: 'Time used', value: String(tag[0].timeUsed), inline: true },
              { name: 'Owner', value: `${tagOwner.mention} (${formatUser(tagOwner)})`, inline: true },
            ],
            footer: { icon_url: tagOwner.avatarURL, text: `Owner ID: ${tagOwner.id}` },
            timestamp: new Date(),
          },
        ],
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagList(args: Args): Promise<IInteractionResponse> {
    const { value } = args // name = page, value = queue || existing
    const tags = await this.TAGS.find({}).toArray()
    const queuedTags = await this.QUEUED_TAGS.find({}).toArray()

    let res = ''

    switch (value!) {
      case 'queue':
        res = `${queuedTags.length > 0 ? queuedTags.map((qt) => `\`${qt.name}\``).join(', ') : '**No tags available**'}`
        break
      case 'existing':
        res = `${tags.length > 0 ? tags.map((t) => `\`${t.name}\``).join(', ') : '**No tags available**'}`
        break
    }

    // todo: make it so tags will split into pages
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: res,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagAdd(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name, value } = args

    const [isInQueue, isPassed] = await TagUtils.tagExists(name) // true = exist
    if (isInQueue || isPassed)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` already exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    const guild = (await interaction.getGuild())!
    const user = (await interaction.getUser())!

    await TagUtils.queueAction(name, value!, user, 'add', guild)
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been sent to the queue.`,
        flags: InteractionResponseFlags.EPHEMERAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagDelete(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].author_id)!.user
    if (tag[0].author_id !== interaction.data.member?.user.id)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to delete this tag. Ask tag owner ${tagOwner.mention} (${formatUser(tagOwner)}).`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    await this.TAGS.deleteOne({ name })
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been deleted.`,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagPublic(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name, value } = args // name - name, value - true/false

    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].author_id)!.user
    if (tag[0].author_id !== interaction.data.member?.user.id)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to modify this tag. Ask tag owner ${tagOwner.mention} (${formatUser(tagOwner)}).`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    await this.TAGS.updateOne({ name }, { $set: { public: (value === 'true') } })

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been updated. Tag is now \`${(value === 'true') ? 'public' : 'private'}\``,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async onTagEdit(args: Args, interaction: Interaction, actionType: 'edit' | 'rename'): Promise<IInteractionResponse> {
    const { name, value } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    const guild = (await interaction.getGuild())!
    const user = (await interaction.getUser())!

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    await TagUtils.queueAction(name, value!, user, actionType, guild)
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag changes has been sent to the queue.`,
        flags: InteractionResponseFlags.EPHEMERAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }

  async checkTag(args: Args, interaction: Interaction, option: 'approve' | 'decline'): Promise<IInteractionResponse> {
    const { name } = args

    const guild = (await interaction.getGuild())!
    const member = (await interaction.getMember(guild))!
    const queuedTag = await this.QUEUED_TAGS.findOne({ _id: Number(name) })

    if (queuedTag === null)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag with id ${name} not found in the queue.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    if (!member.permissions.has('manageMessages'))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to do that.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
        },
      }

    if (option === 'approve') {
      switch (queuedTag.type) {
        case 'add':
          await this.TAGS.insertOne({
            name: queuedTag.name,
            content: queuedTag.value,
            author_id: queuedTag.ownerId,
            public: false,
            timeUsed: 0,
          })
          break
        case 'edit':
          await this.TAGS.updateOne({ name: queuedTag.name }, { $set: { content: queuedTag.value } })
          break
        case 'rename':
          await this.TAGS.updateOne({ name: queuedTag.name }, { $set: { name: queuedTag.value } })
          break
      }
    }

    await this.QUEUED_TAGS.deleteOne({ _id: Number(name) })
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag changes/creation has been successfully ${option}d.`,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }
  }
}
