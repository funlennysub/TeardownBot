import chalk, { ForegroundColor } from 'chalk'

namespace Logger {
  const timeColor: typeof ForegroundColor = 'cyanBright'
  const successColor: typeof ForegroundColor = 'greenBright'
  const useColor: typeof ForegroundColor = 'magentaBright'
  const warnColor: typeof ForegroundColor = 'yellowBright'

  export function logSuccess(text: string, separator: string = '|'): void {
    const response = [
      chalk[timeColor](new Date().toUTCString()),
      separator,
      chalk[successColor](text),
    ]
    console.log(response.join(' '))
  }

  export function logUse(text: string, separator: string = '|'): void {
    const response = [
      chalk[timeColor](new Date().toUTCString()),
      separator,
      chalk[useColor](text),
    ]
    console.log(response.join(' '))
  }

  export function logWarn(text: string, separator: string = '|'): void {
    const response = [
      chalk[timeColor](new Date().toUTCString()),
      separator,
      chalk[warnColor](text),
    ]
    console.log(response.join(' '))
  }
}

export default Logger
