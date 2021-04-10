import IInteractionResponseData from './IInteractionResponseData'
import InteractionResponseType from './InteractionResponseType'

type IInteractionResponse =
  | { type: InteractionResponseType, }
  | {
  type: InteractionResponseType.RESPONSE | InteractionResponseType.RESPONSE_NO_INPUT,
  data: IInteractionResponseData,
}

export default IInteractionResponse
