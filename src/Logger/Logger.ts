import chalk, { ForegroundColor } from 'chalk'

export default class Logger {
  private readonly timeColor: typeof ForegroundColor
  private readonly successColor: typeof ForegroundColor
  private readonly useColor: typeof ForegroundColor

  constructor() {
    this.timeColor = 'cyanBright'
    this.successColor = 'greenBright'
    this.useColor = 'magentaBright'
  }

  logSuccess(text: string, separator: string = '|') {
    const response = [
      chalk[this.timeColor](new Date().toUTCString()),
      separator,
      chalk[this.successColor](text),
    ]
    console.log(response.join(' '))
  }

  logUse(text: string, separator: string = '|') {
    const response = [
      chalk[this.timeColor](new Date().toUTCString()),
      separator,
      chalk[this.useColor](text),
    ]
    console.log(response.join(' '))
  }
}