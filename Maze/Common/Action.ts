import {SlideActionWithRotation} from './Board/SlideAction';
import { Coordinate } from './Board/Coordinate';

/**
 * An action is either a move or a pass. It represents what action a player can take
 * in the game Labyrinth given that it is their turn.
 */
export type Action = Move | Pass;

/**
 * Represents a move that player can make in the game Labyrinth.
 * A move is a combination of a slide action and displacement of a player.
 */
export interface Move {
  type: ActionType.MOVE,
  slideAction: SlideActionWithRotation;
  moveTo: Coordinate;
}

/**
 * Represents a pass action that a player can make in the game Labyrinth.
 */
export interface Pass {
  type: ActionType.PASS
}

/**
 * Represents the type an {@link Action} could be.
 */
export enum ActionType {
  MOVE = 'MOVE',
  PASS = 'PASS'
}
