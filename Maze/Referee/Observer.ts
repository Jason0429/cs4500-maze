import { GameState } from '../Common/State/GameState';
import { GameResult } from './GameResult';

/**
 * Observers comprise a set of callbacks to gain information
 * about an ongoing game of Labyrinth.
 */
export interface Observer {
  /**
   * Callback that is invoked when the state of a Labyrinth game
   * changes due to a player's action.
   */
  stateUpdate(state: GameState, passed: number): void;

  /**
   * Callback that is invoked when the game finishes.
   */
  gameOver(result: GameResult): void;
}

/**
 * Allows implemented objects to be observed by attaching and removing {@link Observer}s.
 */
export interface Observable {
  /**
 * Attaches an {@link Observer} to this referee for monitoring changes to the game state.
 *
 * Observers can be attached at any time, including during the game.
 */
  attachObserver(observer: Observer): void;

  /**
   * Removes the {@link Observer} reference and stops sending events.
   */
  removeObserver(observer: Observer): void;
}
