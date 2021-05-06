import BaseInteractionCommand from '../Interactions/BaseInteractionCommand'
import Interaction from '../Interactions/Interaction'
import CommandOptionType from '../Interactions/Types/CommandOptionType'
import IInteractionResponse from '../Interactions/Types/IInteractionResponse'
import InteractionResponseFlags from '../Interactions/Types/InteractionResponseFlags'
import InteractionResponseType from '../Interactions/Types/InteractionResponseType'
import { Argument, DocsJSON, Return } from '../Types/Docs'
import req from 'petitio'

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
        allowed_mentions: { users: false, roles: false, everyone: false, repliedUser: false },
      },
    }

    const branch = args.branch === undefined ? 'stable' : args.branch

    const res = await req(`https://raw.githubusercontent.com/funlennysub/teardown-api-docs-json/latest/${branch}_api.json`).json<DocsJSON>()
    const name: string = args.name
    const docs = res.api

    const apiCategory = docs.find((cat) => cat.functions.find((func) => func.name.toLowerCase() === name.toLowerCase()))
    if (apiCategory === undefined)
      return {
        type: InteractionResponseType.RESPONSE,
        data: {
          content: `Function \`${name}\` not found.`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }
    const apiFunction = apiCategory.functions.find((func) => func.name.toLowerCase() === name.toLowerCase())!

    const URL = res.baseURL + apiFunction.name
    const argsFormatted = apiFunction.arguments.length > 0 ? this.formatAPIArgs(apiFunction.arguments) : 'none'
    const returnValuesFormatted = apiFunction.return.length > 0 ? this.formatAPIArgs(apiFunction.return) : 'none'
    const info = apiFunction.info
    const definition = apiFunction.def
    const example = `\`\`\`lua\n${apiFunction.example}\n\`\`\``

    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: URL,
        embeds: [
          {
            color: 0xf0d080,
            title: `#${apiFunction.name}`,
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
      },
    }
  }

  private formatAPIArgs = (argsArray: Array<Argument> | Array<Return>) => {
    let res = ''
    argsArray.map((a) => {
      res += `\`${a.name}\` (${a.optional ? a.type + ', optional' : a.type}) - ${a.desc.replace('&ndash; ', '')}\n\n`
    })
    return res
  }
}
