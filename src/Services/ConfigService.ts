import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export interface IConfig {
  applicationId: string,
  guild: string,
  queueChannel: string,
  owners: Array<string>
  mongodb: {
    db: string,
    tagsCollection: string,
    queueCollection: string,
    uri: string,
  },
}

class ConfigService {
  config!: IConfig

  constructor() {
    this.read()
  }

  save(): void {
    writeFileSync(resolve(__dirname, '../../config.json'), JSON.stringify(this.config, null, 2))
  }

  read(): void {
    this.config = JSON.parse(readFileSync(resolve(__dirname, '../../config.json'), 'utf8'))
  }
}

export default new ConfigService()