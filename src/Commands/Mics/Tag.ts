import { Collection } from 'mongodb'
import Interaction from '../../Interactions/Interaction'
import CommandOptionType from '../../Interactions/Types/CommandOptionType'
import IInteractionResponse from '../../Interactions/Types/IInteractionResponse'
import InteractionResponseFlags from '../../Interactions/Types/InteractionResponseFlags'
import InteractionResponseType from '../../Interactions/Types/InteractionResponseType'
import ConfigService from '../../Services/ConfigService'
import MongoService from '../../Services/MongoService'
import BaseInteractionCommand from '../../Interactions/Commands/BaseInteractionCommand'
import { Tag } from '../../Types/Tags'
import Discord from '../../Utils/Discord'
import TagUtils from '../../Utils/Tag'
import { AllowedMentions } from 'eris'
import formatUser = Discord.formatUser

type Args = { _: Array<string>, name: string, value?: string }
const allowedMentions: AllowedMentions = { users: false, roles: false, everyone: false, repliedUser: false }

export default class TagsCommand extends BaseInteractionCommand {
  private ALLOWED_CHANNELS: Array<string>
  private TAGS: Collection<Tag>

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
              name: 'name',
              description: 'make discord happy',
              type: CommandOptionType.STRING,
              required: true,
              choices: [
                { name: 'existing', value: 'existing' }
              ]
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
                { name: 'public', value: 'true' },
                { name: 'private', value: 'false' },
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
      ],
    })

    this.ALLOWED_CHANNELS = ['780106606456733727', '768940642767208468', '806440595891290142']
    this.TAGS = MongoService.getCollection<Tag>(ConfigService.config.mongodb.tagsCollection)
  }

  async run(args: Args, interaction: Interaction): Promise<IInteractionResponse | void> {
    // 'use' | 'info | 'list' | 'add' | 'delete' | 'public' | 'rename' | 'edit'
    const action = args._[1]
    if (!this.ALLOWED_CHANNELS.includes(interaction.data.channel_id!))
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Commands are not allowed in this channel. Allowed channels: ${this.ALLOWED_CHANNELS.map((ch) => `<#${ch}>`).join(', ')}`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }
    switch (action) {
      case 'use':
        return await this.onTagUse(args)
      case 'info':
        return await this.onTagInfo(args, interaction)
      case 'list':
        return await this.onTagList()
      case 'add':
        return await this.onTagAdd(args, interaction)
      case 'delete':
        return await this.onTagDelete(args, interaction)
      case 'public':
        return await this.onTagPublic(args, interaction)
      case 'rename':
        return await this.onTagEdit(args, 'rename', interaction)
      case 'edit':
        return await this.onTagEdit(args, 'edit', interaction)
    }
    return void 0
  }

  private async onTagUse(args: Args): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    await this.TAGS.updateOne({ name }, { $inc: { timeUsed: 1 } })
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: tag[0].content.replace(/\\n/g, '\n'),
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  private async onTagInfo(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].ownerId)!.user
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
        allowed_mentions: allowedMentions,
      },
    }
  }

  private async onTagList(): Promise<IInteractionResponse> {
    const tags = await this.TAGS.find({}).toArray()

    // todo: make it so tags will split into pages
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `${tags.length > 0 ? tags.map((t) => `\`${t.name}\``).join(', ') : '**No tags available**'}`,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  private async onTagAdd(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name, value } = args

    const exists = await TagUtils.tagExists(name)
    if (exists)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` already exists.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    await this.TAGS.insertOne({
      name: name,
      content: value!,
      ownerId: interaction.data.member!.user.id,
      public: false,
      timeUsed: 0,
    })

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been created.`,
        flags: InteractionResponseFlags.EPHEMERAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  private async onTagDelete(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].ownerId)!.user

    if (tag[0].ownerId !== interaction.data.member?.user.id)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to delete this tag. Ask tag owner ${tagOwner.mention} (${formatUser(tagOwner)}).`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
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

  private async onTagPublic(args: Args, interaction: Interaction): Promise<IInteractionResponse> {
    const { name, value } = args // name - name, value - true/false

    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].ownerId)!.user

    if (tag[0].ownerId !== interaction.data.member?.user.id)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to modify this tag. Ask tag owner ${tagOwner.mention} (${formatUser(tagOwner)}).`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    await this.TAGS.updateOne({ name }, { $set: { public: (value === 'true') } })

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been updated. Tag is now \`${(value === 'true') ? 'public' : 'private'}\``,
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  private async onTagEdit(args: Args, actionType: 'edit' | 'rename', interaction: Interaction): Promise<IInteractionResponse> {
    const { name, value } = args
    const tag = await this.TAGS.find({ name }).collation({ strength: 2, locale: 'en_US' }).toArray()

    if (tag.length === 0)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Tag \`${name}\` doesn't exist.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const guild = (await interaction.getGuild())!
    const tagOwner = guild.members.get(tag[0].ownerId)!.user

    if (!tag[0].public && tag[0].ownerId !== interaction.data.member?.user.id)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `You don't have permissions to modify this tag. Ask tag owner ${tagOwner.mention} (${formatUser(tagOwner)}`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    switch (actionType) {
      case 'edit':
        await this.TAGS.updateOne({ name }, { $set: { content: value! } })
        break
      case 'rename':
        await this.TAGS.updateOne({ name }, { $set: { name: value! } })
    }

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Tag \`${name}\` has been updated.`,
        flags: InteractionResponseFlags.EPHEMERAL,
        allowed_mentions: allowedMentions,
      },
    }
  }
}
