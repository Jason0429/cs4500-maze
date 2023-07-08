import {Action, ActionType} from '../Common/Action';
import {BoardUtils} from './BoardUtils';

export class MoveUtils {
  static sameAction(action1: Action, action2: Action) {
    if (action1.type === ActionType.PASS || action2.type === ActionType.PASS) {
      return action1.type === action2.type;
    }
    return BoardUtils.slideActionEqual(action1.slideAction, action2.slideAction)
      && action1.moveTo.equals(action2.moveTo);
  }
}
