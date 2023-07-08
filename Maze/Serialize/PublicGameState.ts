import {JsonState, serializeStateByParams} from './GameState';
import {PublicGameState} from '../Common/State/PublicGameState';

export function serializePublicGameState(stateInfo: PublicGameState): JsonState {
  return serializeStateByParams(stateInfo.getBoard(), stateInfo.getSpareTile(), stateInfo.getPlayerStates(), stateInfo.getLastSlideAction());
}
