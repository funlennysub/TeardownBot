import ICommandData from './Types/ICommandData'
import req from 'petitio'
import { PetitioResponse } from 'petitio/dist/lib/PetitioResponse'
import InteractionConstants from './Constants'
import ConfigService from '../Services/ConfigService'

namespace CommandUtils {
  export async function getGuildCommands(guildId: string, applicationId: string): Promise<Array<{ name: string; id: string }>> {
    const request = await req(`${InteractionConstants.baseURL}${InteractionConstants.commands(applicationId, guildId)}`, 'GET')
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
    return request.json()
  }

  export async function deleteGuildCommand(guildId: string, id: string, applicationId: string): Promise<void> {
    return void await req(`${InteractionConstants.baseURL}${InteractionConstants.commands(applicationId, guildId)}/${id}`, 'DELETE')
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
      .send()
  }

  export async function setGuildCommand(guildId: string, command: ICommandData, applicationId: string): Promise<PetitioResponse> {
    return await req(`${InteractionConstants.baseURL}${InteractionConstants.commands(applicationId, guildId)}`, 'POST')
      .body(JSON.stringify(command))
      .header({ 'Content-Type': 'application/json' })
      .header({ 'Authorization': `Bot ${ConfigService.config.bot.token}` })
      .send()
  }
}

export default CommandUtils
