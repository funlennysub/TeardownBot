import fetch from 'node-fetch'
import Bot from '../Bot'
import ICommandData from './Types/ICommandData'

namespace CommandUtils {
  export async function getGuildCommands(guild: string, applicationId: string): Promise<Array<{ name: string; id: string }>> {
    const request = await fetch('https://discord.com/api/v8/applications/' + applicationId + '/guilds/' + guild + '/commands', {
      method: 'get',
      headers: {
        Authorization: 'Bot ' + Bot.token,
      },
    })
    return request.json()
  }

  export async function deleteGuildCommand(guild: string, id: string, applicationId: string): Promise<void> {
    return void (await fetch('https://discord.com/api/v8/applications/' + applicationId + '/guilds/' + guild + '/commands/' + id, {
      method: 'delete',
      headers: {
        Authorization: 'Bot ' + Bot.token,
      },
    }))
  }

  export async function setGuildCommand(guild: string, command: ICommandData, applicationId: string): Promise<void> {
    const request = await fetch('https://discord.com/api/v8/applications/' + applicationId + '/guilds/' + guild + '/commands', {
      method: 'post',
      body: JSON.stringify(command),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bot ' + Bot.token,
      },
    })
    return request.json()
  }
}

export default CommandUtils
