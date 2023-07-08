import {isArrayOfLength, JsonDeserializeError} from './utils';
import {Action, ActionType} from '../Common/Action';
import {deserializeDegrees, deserializeDirection, deserializeIndex} from './GameState';
import {deserializeCoordinate} from './Board';

/**
 * Converts the given object to void if the obj is equal to the string void; throws otherwise
 * as it is malformed or invalid
 */
export function deserializeVoidResult(obj: unknown): void {
  if (obj === 'void') {
    return;
  }

  throw new JsonDeserializeError('Invalid void message provided', obj);
}

/**
 * Converts the given object to an action if the obj is a valid choice; throws otherwise
 * as it is malformed or invalid
 */
export function deserializeChoiceResult(obj: unknown): Action {
  if (obj === 'PASS') {
    return {type: ActionType.PASS};
  }
  if (isArrayOfLength(obj, 4)) {
    const index = deserializeIndex(obj[0]);
    const direction = deserializeDirection(obj[1]);
    const degrees = deserializeDegrees(obj[2]);
    const coordinate = deserializeCoordinate(obj[3]);
    return {
      type: ActionType.MOVE,
      slideAction: {
        direction: direction,
        index: index,
        rotations: degrees / 90,
      },
      moveTo: coordinate,
    };
  }
  throw new JsonDeserializeError('Given object is not a valid choice/action', obj);
}
