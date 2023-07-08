import { BasicGameState, GameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { JsonCoordinate, deserializeBoard, deserializeCoordinate } from './Board';
import { deserializePS, deserializeTestPS, JsonPS } from './PS';
import {
  JsonPlayer,
  JsonState,
  deserializeTile,
  deserializeAvatar,
  deserializeSlideAction,
} from './GameState';
import { Player } from '../Players/Player';
import { assertHasKeys, isArray, isArrayOfLength, JsonDeserializeError } from './utils';
import { Color } from '../Utility/Color';
import { Map as ImmutableMap } from 'immutable';

/**
 * A JSON array of PS. The names of any two PS's must be distinct
 */
export type JsonPlayerSpec = JsonPS[];

export interface JsonRefereePlayer extends JsonPlayer {
  goto: JsonCoordinate;
}

export interface JsonRefereeState extends Omit<JsonState, 'plmt'> {
  plmt: JsonRefereePlayer[];
}

/**
 * Converts the given object to a BasicGameState and a list of Player, throwing an error if
 * input is malformed or invalid
 */
export function deserializeRefereeStateWithPS(obj: unknown, test = false): [GameState, Player[]] {
  if (isArrayOfLength(obj, 2)) {
    const players = deserializeRefereePlayers(obj[0], test);
    return [deserializeRefereeState(obj[1]), players];
  }
  throw new JsonDeserializeError('Given object is not a valid RefereeState and Player array', obj);
}

/**
 * Converts the given object to a BasicGameState, throwing an error if
 * input is malformed or invalid
 */
export function deserializeRefereeState(obj: unknown): GameState {
  assertHasKeys(obj, ['board', 'spare', 'plmt', 'last']);
  const stateObj = obj as Record<'board' | 'spare' | 'plmt' | 'last', unknown>;

  if (isArray(stateObj.plmt)) {
    const board = deserializeBoard(stateObj.board);
    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    const avatars = stateObj.plmt.map(player => {
      assertHasKeys(player, ['goto']);
      const typedPlayer = player as Record<'goto', unknown>;

      const avatar = deserializeAvatar(typedPlayer);
      playersInfo = playersInfo.set(avatar.color, {
        goto: deserializeCoordinate(typedPlayer.goto),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });

      return avatar;
    });

    const lastMove = deserializeSlideAction(stateObj.last);

    let goalSequence;
    if ('goals' in stateObj) {
      const goals = (stateObj as any)['goals'];
      if (isArray(goals)) {
        goalSequence = goals.map((g) => deserializeCoordinate(g));
      }
    }

    const state = new BasicGameState(
      avatars,
      board,
      deserializeTile(stateObj.spare),
      playersInfo,
      lastMove,
      goalSequence
    );
    return state;
  }
  throw new JsonDeserializeError('Given object is not a valid RefereeState and Player array', obj);
}

/**
 * Converts the given object to an array of Player, throwing an error if
 * input is malformed or invalid
 */
export function deserializeRefereePlayers(obj: unknown, test: boolean): Player[] {
  const PSfun = test ? deserializeTestPS : deserializePS;

  if (isArray(obj)) {
    return obj.map(item => PSfun(item));
  }

  throw new JsonDeserializeError('Invalid player list given', obj);
}
