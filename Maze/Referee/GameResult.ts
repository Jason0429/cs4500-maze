import {Set} from 'immutable';
import {Player} from '../Players/Player';

/**
 * Records the winners of a completed game of Labyrinth.
 */
export interface GameResult {
    /**
     * A set containing the winners of the game.
     */
    readonly winners: Set<Player>;

    /**
     * A set containing players that were removed for misbehaving.
     */
    readonly removed: Set<Player>;
}
