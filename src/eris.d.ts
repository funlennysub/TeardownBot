import { Db } from 'mongodb'

declare module 'eris' {

  interface Client {
    mongodb: Db
  }

  interface Base {
    _client: Client
  }
}