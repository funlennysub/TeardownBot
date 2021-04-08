import BaseInteractionCommand from '..//BaseInteractionCommand'
import IInteractionResponse from '../Interactions/types/IInteractionResponse'
import InteractionResponseType from '../Interactions/types/InteractionResponseType'
import Interaction from '../Interactions/Interaction'
import InteractionResponseFlags from '../Interactions/types/InteractionResponseFlags'

export default class PingCommand extends BaseInteractionCommand {
  constructor() {
    super({
      name: 'ping',
      description: 'Test command',
      options: [],
    })
  }

  async run(args: Record<string, any>, interaction: Interaction): Promise<IInteractionResponse> {
    // const member = await interaction.getMember()
    // if (!member?.permissions.has('manageRoles'))
    //   return {
    //     type: InteractionResponseType.RESPONSE_NO_INPUT,
    //     data: {
    //       content: 'You don\'t have perms.',
    //       flags: InteractionResponseFlags.EPHEMERAL,
    //     },
    //   }

    return {
      type: InteractionResponseType.RESPONSE_NO_INPUT,
      data: {
        content: 'pong',
        flags: InteractionResponseFlags.EPHEMERAL
      },
    }
  }
}