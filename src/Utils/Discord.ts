import { AnyGuildChannel, Guild, GuildTextableChannel, Member, Message, TextChannel, User } from 'eris'

namespace DiscordUtils {
  export const TIME_MAP: Record<string, number> = { y: 31556952e3, mo: 2592e6, w: 604800e3, d: 86400e3, h: 3600e3, m: 60e3, s: 1e3 }

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

  export function clearMessage(message: string, guild: Guild): string {
    return message
      .replace(/<@!?([0-9]+)>/g, (_, uId) => `@${guild.members.get(uId)?.nick ?? guild._client.users.get(uId)?.username ?? 'invalid-user'}`)
      .replace(/<@&([0-9]+)>/g, (_, rId) => `@${guild.roles.get(rId)?.name ?? 'invalid-role'}`)
  }

  export function isTextChannel(channel: AnyGuildChannel): boolean {
    return channel.type === 0 || channel.type === 5
  }

  export function hasChannelAccess(channel: AnyGuildChannel, member: Member): boolean {
    if (!isTextChannel(channel)) return false
    return (channel as unknown as TextChannel).permissionsOf(member).has('sendMessages')
  }

  export function capitalizeString(string: string): string {
    return string[0].toUpperCase() + string.slice(1).toLowerCase()
  }

  export function convertTimeToMs(time: string): number | null {
    const regex = /(\d+)(y|mo|w|d|h|m|s)/g
    let match = [...time.matchAll(regex)]
    if (match.length === 0) return null

    let res = 0
    match.map((dur) => res += TIME_MAP[dur[2]] * Number(dur[1]))
    return res
  }
}

export default DiscordUtils
