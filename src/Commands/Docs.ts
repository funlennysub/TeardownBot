import BaseInteractionCommand from '../Interactions/BaseInteractionCommand'
import Interaction from '../Interactions/Interaction'
import CommandOptionType from '../Interactions/Types/CommandOptionType'
import IInteractionResponse from '../Interactions/Types/IInteractionResponse'
import InteractionResponseFlags from '../Interactions/Types/InteractionResponseFlags'
import InteractionResponseType from '../Interactions/Types/InteractionResponseType'
import { APIFunction, Argument, Category, DocsJSON, Return } from '../Types/Docs'
import req from 'petitio'
import { AllowedMentions } from 'eris'

const allowedMentions: AllowedMentions = { users: false, roles: false, everyone: false, repliedUser: false }

export default class PingCommand extends BaseInteractionCommand {
  private ALLOWED_CHANNELS: Array<string>

  constructor() {
    super({
      name: 'docs',
      description: 'Teardown LUA API documentation',
      options: [
        {
          name: 'name',
          description: 'Function name',
          type: CommandOptionType.STRING,
          required: true,
        },
        {
          name: 'branch',
          description: 'Experimental or stable game version',
          type: CommandOptionType.STRING,
          choices: [
            {
              name: 'stable',
              value: 'stable',
            },
            {
              name: 'experimental',
              value: 'exp',
            },
          ],
        },
      ],
    })

    this.ALLOWED_CHANNELS = ['780106606456733727', '768940642767208468', '806440595891290142']
  }

  async run(args: { _: Array<string>, name: string, branch?: 'stable' | 'exp' }, interaction: Interaction): Promise<IInteractionResponse> {
    const channel = await interaction.getChannel()

    if (!this.ALLOWED_CHANNELS.includes(channel!.id)) return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: `Commands are not allowed in this channel. Allowed channels: ${this.ALLOWED_CHANNELS.map((ch) => `<#${ch}>`).join(', ')}`,
        flags: InteractionResponseFlags.EPHEMERAL,
        allowed_mentions: allowedMentions,
      },
    }

    const branch = args.branch ?? 'stable'
    const res = await req(`https://raw.githubusercontent.com/funlennysub/teardown-api-docs-json/latest/${branch}_api.json`).json<DocsJSON>()
    const name = args.name

    const [category, apiFunction] = this.findDoc(name, res)

    if (category === undefined && apiFunction === undefined)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Function \`${name}\` not found.`,
          flags: InteractionResponseFlags.EPHEMERAL,
          allowed_mentions: allowedMentions,
        },
      }

    const URL = res.baseURL + apiFunction!.name
    const argsFormatted = apiFunction!.arguments.length > 0 ? this.formatAPIArgs(apiFunction!.arguments) : 'none'
    const returnValuesFormatted = apiFunction!.return.length > 0 ? this.formatAPIArgs(apiFunction!.return) : 'none'
    const info = apiFunction!.info
    const definition = apiFunction!.def
    const example = `\`\`\`lua\n${apiFunction!.example}\n\`\`\``

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: URL,
        embeds: [
          {
            color: 0xf0d080,
            title: `#${apiFunction!.name}`,
            url: URL,
            description: `\`${definition}\`\n\n${info}`,
            fields: [
              { name: 'Arguments', value: argsFormatted },
              { name: 'Return value', value: returnValuesFormatted },
              { name: 'Example', value: example },
            ],
            footer: { text: `API(Game) Version ${res.version}` },
          },
        ],
        flags: InteractionResponseFlags.NORMAL,
        allowed_mentions: allowedMentions,
      },
    }
  }

  private findDoc(name: string, docs: DocsJSON): [Category?, APIFunction?] {
    for (const cat of docs.api) {
      for (const func of cat.functions) {
        if (func.name.toLowerCase() === name.toLowerCase()) return [cat, func]
      }
    }
    return [undefined, undefined]
  }

  private formatAPIArgs(argsArray: Array<Argument | Return>) {
    let res = ''
    argsArray.map((a) => {
      res += `\`${a.name}\` (${a.optional ? `${a.type}, optional` : a.type}) - ${a.desc.replace('&ndash; ', '')}\n`
    })
    return res
  }
}
