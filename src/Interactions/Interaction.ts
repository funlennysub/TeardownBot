import { AllowedMentions, Channel, Client, Embed, Guild, Member, User } from 'eris'
import ConfigService from '../Services/ConfigService'
import IInteraction from './Types/IInteraction'
import IInteractionFollowUp from './Types/IInteractionFollowUp'
import IInteractionResponse from './Types/IInteractionResponse'
import InteractionResponseType from './Types/InteractionResponseType'
import req from 'petitio'
import { PetitioResponse } from 'petitio/dist/lib/PetitioResponse'
import InteractionConstants from './Constants'

const botId = ConfigService.config.applicationId

export default class Interaction {
  responded = false

  constructor(public data: IInteraction, private client: Client) {}

  private static get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    }
  }

  async getGuild(): Promise<Guild | undefined> {
    if (this.data.guild_id) return this.client.guilds.get(this.data.guild_id)
  }

  async getChannel(): Promise<Channel | undefined> {
    if (this.data.channel_id) return this.client.getChannel(this.data.channel_id)
  }

  async getMember(guild?: Guild): Promise<Member | undefined> {
    if (!guild) guild = await this.getGuild()
    return guild?.members.get(this.data.member!.user.id)
  }

  async getUser(): Promise<User | undefined> {
    return this.client.users.get(this.data.member!.user.id)
  }

  async deferRespond(): Promise<PetitioResponse> {
    return this.respond({
      type: InteractionResponseType.WAIT,
    })
  }

  async respond(response: IInteractionResponse): Promise<PetitioResponse> {
    this.responded = true
    return await req(`${InteractionConstants.baseURL}/interactions/${this.data.id}/${this.data.token}/callback`, 'POST')
      .body(JSON.stringify(response))
      .header(Interaction.headers)
      .send()
  }

  async send(content: string, options: IInteractionFollowUp = {}): Promise<PetitioResponse> {
    return await req(`${InteractionConstants.baseURL}/webhooks/${botId}/${this.data.token}`, 'POST')
      .body(JSON.stringify({ content, ...options }))
      .header(Interaction.headers)
      .send()
  }

  async edit(id: string, content: string | { content?: string, embeds: Array<Embed>, allowed_mentions: AllowedMentions }): Promise<PetitioResponse> {
    return await req(`${InteractionConstants.baseURL}/webhooks/${botId}/${this.data.token}/messages/${id}`, 'PATCH')
      .body(JSON.stringify(typeof content === 'string' ? { content } : content))
      .header(Interaction.headers)
      .send()
  }

  async deleteMessage(id: '@original' | string): Promise<PetitioResponse> {
    return await req(`${InteractionConstants.baseURL}/webhooks/${botId}/${this.data.token}/messages/${id}`, 'DELETE')
      .header(Interaction.headers)
      .send()
  }

  generateArguments(): { _: string[] } {
    let { data } = this.data
    let map = { _: [data.name] }

    walk(data.options)
    return map

    function walk(opts) {
      for (let { name, value, options } of opts) {
        if (options) {
          map._.push(name)
          walk(options)
        } else {
          map[name] = value
        }
      }
    }
  }
}
