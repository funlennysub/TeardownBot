import InteractionResponseType from './InteractionResponseType'
import IInteractionResponseData from './IInteractionResponseData'

type IInteractionResponse =
  | {
  type: InteractionResponseType;
}
  | {
  type: InteractionResponseType.RESPONSE | InteractionResponseType.RESPONSE_NO_INPUT;
  data: IInteractionResponseData;
};

export default IInteractionResponse
