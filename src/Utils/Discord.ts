import { User } from 'eris'

namespace Discord {
  // https://github.com/funlennysub/date-to-discord-snowflake/blob/master/index.js
  let epoch = 1420070400000 // Milliseconds since Discord Epoch, the first second of 2015 or 1420070400000.
  let increment = 0

  export function timestampToSnowflake(timestamp = new Date().getTime()) {
    let str = ''

    // timestamp
    str += ((timestamp - epoch)).toString(2).padStart(42, '0')
    // worker id
    str += '00001'
    // process id
    str += '00000'
    // increment
    str += (increment++ % 2 ** 12).toString(2).padStart(12, '0')

    return parseInt(str, 2)
  }

  export function formatUser(user: User): string {
    return `${user.username}#${user.discriminator}`
  }
}

export default Discord