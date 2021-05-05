import chalk, { ForegroundColor } from 'chalk'

export default class Logger {
  private static timeColor: typeof ForegroundColor = 'cyanBright'
  private static successColor: typeof ForegroundColor = 'greenBright'
  private static useColor: typeof ForegroundColor = 'magentaBright'
  private static warnColor: typeof ForegroundColor = 'yellowBright'

  private constructor() {}

  public static logSuccess(text: string, separator: string = '|'): void {
    const response = [
      chalk[Logger.timeColor](new Date().toUTCString()),
      separator,
      chalk[Logger.successColor](text),
    ]
    console.log(response.join(' '))
  }

  public static logUse(text: string, separator: string = '|'): void {
    const response = [
      chalk[Logger.timeColor](new Date().toUTCString()),
      separator,
      chalk[Logger.useColor](text),
    ]
    console.log(response.join(' '))
  }

  public static logWarn(text: string, separator: string = '|'): void {
    const response = [
      chalk[Logger.timeColor](new Date().toUTCString()),
      separator,
      chalk[Logger.warnColor](text),
    ]
    console.log(response.join(' '))
  }
}
