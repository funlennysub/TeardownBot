import ICommandData from '../Types/ICommandData'
import req from 'petitio'
import InteractionConstants from '../Constants'
import ConfigService from '../../Services/ConfigService'

type GuildCommands = { name: string, id: string }

namespace CommandUtils {
  export async function getGuildCommands(guildId: string, applicationId: string): Promise<Array<GuildCommands>> {
    const request = await req(InteractionConstants.commands(applicationId, guildId), 'GET')
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
    return request.json<Array<GuildCommands>>()
  }

  export async function deleteGuildCommand(guildId: string, id: string, applicationId: string): Promise<void> {
    return void await req(`${InteractionConstants.commands(applicationId, guildId)}/${id}`, 'DELETE')
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
      .send()
  }

  export async function setGuildCommand(guildId: string, command: ICommandData, applicationId: string): Promise<void> {
    return void await req(InteractionConstants.commands(applicationId, guildId), 'POST')
      .body(JSON.stringify(command))
      .header({ 'Content-Type': 'application/json' })
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
      .send()
  }
}

export default CommandUtils
