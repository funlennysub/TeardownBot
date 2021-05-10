import { Db, MongoClient } from 'mongodb'
import ConfigService from './ConfigService'

export default class MongoService {
  public static client: MongoClient

  public static connect(uri: string) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(`${uri.replace('PASSWORD', ConfigService.config.mongodb.password)}`, { useUnifiedTopology: true }, (error, client: MongoClient) => {
        if (error) {
          reject(error)
        } else {
          MongoService.client = client
          resolve(client)
        }
      })
    })
  }

  public static getDb(): Db {
    return MongoService.client.db(ConfigService.config.mongodb.db)
  }

  public static getCollection = <T>(name: string) => {
    return MongoService.getDb().collection<T>(name)
  }
}
