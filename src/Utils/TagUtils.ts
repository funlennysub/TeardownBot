import { Guild, TextChannel, User } from 'eris'
import { Collection } from 'mongodb'
import ConfigService from '../Services/ConfigService'
import MongoService from '../Services/MongoService'
import { QueuedTag, Tag } from '../Types/Tags'
import Discord from './Discord'
import formatUser = Discord.formatUser
import timestampToSnowflake = Discord.timestampToSnowflake

export type ActionType = 'add' | 'edit' | 'rename'

export default class TagUtils {
  private static tags: Collection<Tag> = MongoService.getCollection<Tag>(ConfigService.config.mongodb.tagsCollection)
  private static queuedTags: Collection<QueuedTag> = MongoService.getCollection<QueuedTag>(ConfigService.config.mongodb.queueCollection)
  private static queueChannel: string = ConfigService.config.queueChannel

  private constructor() {}

  public static tagExists = async (name: string): Promise<Array<boolean>> => {
    const tag = await TagUtils.tags.find({ name }).collation({
      strength: 2,
      locale: 'en_US',
    }).toArray()
    const queuedTag = await TagUtils.queuedTags.find({ name }).collation({
      strength: 2,
      locale: 'en_US',
    }).toArray()

    return [queuedTag.length !== 0, tag.length !== 0]
  }

  public static queueAction = async (name: string, value: string, author: User, actionType: ActionType, guild: Guild) => {
    const actionId = timestampToSnowflake()

    const queueChannel = guild.channels.get(TagUtils.queueChannel)! as TextChannel
    await queueChannel.createMessage({
      content: `Action ID: ${actionId}`,
      embed: {
        color: 0xFF97A7,
        title: 'New tag to check',
        description: value,
        fields: [
          { name: 'Tag name', value: name, inline: true },
          { name: 'Value', value: 'Above 🔼', inline: true },
          { name: 'Author', value: `${author.mention} (${formatUser(author)})`, inline: true },
          { name: 'Action', value: TagUtils.setActionType(actionType) },
        ],
        footer: {
          icon_url: author.avatarURL,
          text: `Author ID: ${author.id}`,
        },
        timestamp: new Date(),
      },
    })
    await TagUtils.queuedTags.insertOne({ _id: actionId, name, value, type: actionType, ownerId: author.id })
    return actionId.toString()
  }

  public static setActionType = (actionType: ActionType) => {
    switch (actionType) {
      case 'add':
        return 'Create new tag'
      case 'edit':
        return 'Edit an existing tag'
      case 'rename':
        return 'Rename an existing tag'
    }
  }
}
