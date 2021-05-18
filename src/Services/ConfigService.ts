import RawConfig from '../Configurations/config.example'
import Config from '../Configurations/config'

export type IConfig = typeof RawConfig

class ConfigService {
  public config: IConfig

  constructor() {
    this.config = Config
  }
}

export default new ConfigService()
