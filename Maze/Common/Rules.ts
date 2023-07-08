import {PublicGameState} from './State/PublicGameState';
import {NumUtil} from '../Utility/Number';
import {Action, ActionType} from './Action';
import {SlideAction, slideActionsAreOpposites} from './Board/SlideAction';
import {HorizontalDirection, VerticalDirection} from './Direction';


export class Rules {


  /**
   * Checks if the given action is given in the given stateInfo.
   * Assumes that the action is being executed by the currently active player
   * in the given StateInfo
   */
  public static isActionLegal(stateInfo: PublicGameState, action: Action): boolean {
    if (action.type === ActionType.PASS) {
      return true;
    }

    if (!this.isSlideActionLegal(stateInfo, action.slideAction)) {
      return false;
    }

    const dest = action.moveTo;

    let isLegal = false;
    stateInfo.trySlideActionAndUndo(action.slideAction, (state) => {
      const cur = state.getActivePlayerState().position;
      if (!cur.equals(dest)) {
        isLegal = state.getBoard().canReachCoordinate(cur, dest);
      }
    });
    return isLegal;
  }


  public static isRowMoveable(index: number): boolean {
    return index % 2 === 0;
  }

  public static isColumnMoveable(index: number): boolean {
    return index % 2 === 0;
  }

  /**
   * Checks if the given {@link SlideAction} is given in the given stateInfo.
   * Assumes that the action is being executed by the currently active player
   * in the given StateInfo
   */
  public static isSlideActionLegal(
    stateInfo: PublicGameState,
    action: SlideAction
  ): boolean {
    const lastAction = stateInfo.getLastSlideAction();
    if (lastAction && slideActionsAreOpposites(lastAction, action)) {
      return false;
    }

    return this.isActionIndexMoveable(action);
  }

  /**
   * Checks if the given {@link SlideAction} is legal on the given {@link PublicGameState}
   */
  private static isActionIndexMoveable(
    action: SlideAction
  ): boolean {
    switch (action.direction) {
      case VerticalDirection.UP:
      case VerticalDirection.DOWN:
        return this.isColumnMoveable(action.index);
      case HorizontalDirection.LEFT:
      case HorizontalDirection.RIGHT:
        return this.isRowMoveable(action.index);
    }
  }

  /**
   * Determines if the given number of rotations is legal.
   * Each integer indicates a 90-degree counter-clockwise rotation
   * (eg. 1 = 90, 2 = 180, etc.)
   */
  private static isRotationLegal(degrees: number): boolean {
    return NumUtil.isNatural(degrees);
  }
}
