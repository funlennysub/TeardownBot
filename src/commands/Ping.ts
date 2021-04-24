import BaseInteractionCommand from '../Types/BaseInteractionCommand'
import Interaction from '../Interactions/Interaction'
import IInteractionResponse from '../Interactions/types/IInteractionResponse'
import InteractionResponseFlags from '../Interactions/types/InteractionResponseFlags'
import InteractionResponseType from '../Interactions/types/InteractionResponseType'

export default class PingCommand extends BaseInteractionCommand {
  constructor() {
    super({
      name: 'ping',
      description: 'Test command',
      options: [],
    })
  }

  async run(args: Record<string, any>, interaction: Interaction): Promise<IInteractionResponse> {
    return {
      type: InteractionResponseType.RESPONSE,
      data: {
        content: 'pong',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    }
  }
}