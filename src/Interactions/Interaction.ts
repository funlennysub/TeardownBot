import { AllowedMentions, Channel, Client, Guild, Member, User } from 'eris'
import fetch, { Response } from 'node-fetch'
import ConfigService from '../Services/ConfigService'
import IInteraction from './Types/IInteraction'
import IInteractionFollowUp from './Types/IInteractionFollowUp'
import IInteractionResponse from './Types/IInteractionResponse'
import InteractionResponseType from './Types/InteractionResponseType'

const botId = ConfigService.config.applicationId

export default class Interaction {
  responded = false

  constructor(public data: IInteraction, private client: Client) {}

  private get headers(): Record<string, any> {
    return {
      // Authorization: 'Bot ' + this.client.token,
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

  async deferRespond(): Promise<Response> {
    return this.respond({
      type: InteractionResponseType.WAIT,
    })
  }

  async respond(response: IInteractionResponse): Promise<Response> {
    this.responded = true
    return fetch('https://discord.com/api/v8/interactions/' + this.data.id + '/' + this.data.token + '/callback', {
      method: 'post',
      body: JSON.stringify(response),
      headers: this.headers,
    })
  }

  async send(content: string, options: IInteractionFollowUp = {}): Promise<Response> {
    return fetch('https://discord.com/api/v8/webhooks/' + botId + '/' + this.data.token, {
      method: 'post',
      body: JSON.stringify({ content, ...options }),
      headers: this.headers,
    })
  }

  async edit(id: string, content: string | { content?: string; embeds: Array<any>; allowed_mentions: AllowedMentions }): Promise<Response> {
    return fetch(
      'https://discord.com/api/v8/webhooks/' + botId + '/' + this.data.token + '/messages/' + id,
      {
        method: 'patch',
        body: JSON.stringify(typeof content === 'string' ? { content } : content),
        headers: this.headers,
      },
    )
  }

  async deleteMessage(id: '@original' | string): Promise<Response> {
    return fetch(
      'https://discord.com/api/v8/webhooks/' + botId + '/' + this.data.token + '/messages/' + id,
      {
        method: 'delete',
        headers: this.headers,
      },
    )
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
