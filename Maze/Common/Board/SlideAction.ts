import {Direction, oppositeDirection} from '../Direction';

/**
 * Represents an action performed on a {@link Board} in the game Maze.
 * A board action consists of two steps:
 * - Sliding a row of tiles. The dislodged tile is the new spare tile.
 * - Places the old spare tile in the hole after sliding.
 */
export interface SlideAction {
  /**
   * Represents the direction to slide the tiles in.
   */
  readonly direction: Direction;

  /**
   * Represents the row or column position on the board to slide,
   * depending on the {@link Direction} of the current {@link SlideAction}.
   */
  readonly index: number;
}

export interface SlideActionWithRotation extends SlideAction {
  /**
   * The number of 90-degree counter-clockwise rotations should be
   * applied to the spare tile before inserting it into the {@link Board}.
   */
  readonly rotations: number;
}
/**
 * Determines whether two actions undo one another.
 */
export function slideActionsAreOpposites(action1?: SlideAction, action2?: SlideAction) {
  if (action1 === undefined || action2 === undefined) return false;
  if (action1.index !== action2.index) return false;

  return oppositeDirection(action1.direction) === action2.direction;
}
