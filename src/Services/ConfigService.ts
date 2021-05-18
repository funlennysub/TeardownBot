import RawConfig from '../conf/config.example'
import Config from '../conf/config'

export type IConfig = typeof RawConfig

class ConfigService {
  config!: IConfig

  constructor() {
    this.read()
  }

  read(): void {
    this.config = Config
  }
}

export default new ConfigService()
