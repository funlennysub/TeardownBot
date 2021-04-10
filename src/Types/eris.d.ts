import { Client } from 'eris'

declare module 'eris' {

  interface Base {
    _client: Client
  }
}