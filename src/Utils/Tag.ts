import { Collection } from 'mongodb'
import ConfigService from '../Services/ConfigService'
import MongoService from '../Services/MongoService'
import { Tag } from '../Types/Tags'

namespace TagUtils {
  const tags: Collection<Tag> = MongoService.getCollection<Tag>(ConfigService.config.mongodb.tagsCollection)

  export async function tagExists(name: string): Promise<boolean> {
    const tag = await tags.find({ name }).collation({
      strength: 2,
      locale: 'en_US',
    }).toArray()

    return tag.length !== 0
  }
}

export default TagUtils
