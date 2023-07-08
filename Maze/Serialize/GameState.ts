import { PublicPlayerState } from '../Common/PublicPlayerState';
import { Board } from '../Common/Board/Board';
import { SlideAction } from '../Common/Board/SlideAction';
import { Direction, HorizontalDirection, VerticalDirection } from '../Common/Direction';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { BasicTile, Tile } from '../Common/Tile/Tile';
import { Color } from '../Utility/Color';
import { Random } from '../Utility/Random';
import {
  deserializeBoard,
  deserializeCoordinate,
  deserializeTreasure,
  isConnector,
  isGem,
  JsonBoard,
  JsonCoordinate,
  JsonGem,
  JsonTreasure,
  serializeBoard,
  serializeCoordinate,
} from './Board';
import {
  assertHasKeys,
  isArray,
  isArrayOfLength,
  isNonNullObject,
  isNumber,
  isString,
  JsonDeserializeError,
} from './utils';
import { NumUtil } from '../Utility/Number';
import { Connector } from '../Common/Tile/Connector';
import { Coordinate } from '../Common/Board/Coordinate';
import { Map as ImmutableMap } from 'immutable';

export interface JsonTile {
  tilekey: Connector;
  '1-image': JsonGem;
  '2-image': JsonGem;
}

/**
 * Checks if the given object is a JsonTile
 */
function isJsonTile(obj: unknown): obj is JsonTile {
  if (isNonNullObject(obj) && 'tilekey' in obj && '1-image' in obj && '2-image' in obj) {
    const typedObj = obj as Record<'tilekey' | '1-image' | '2-image', unknown>;

    return (
      isConnector(typedObj.tilekey) && isGem(typedObj['1-image']) && isGem(typedObj['2-image'])
    );
  }

  return false;
}

/**
 * Converts the given object to a Tile, throwing an error if
 * input is malformed or invalid
 */
export function deserializeTile(obj: unknown): Tile {
  if (isJsonTile(obj)) {
    return new BasicTile(
      obj.tilekey,
      deserializeTreasure([obj['1-image'], obj['2-image']] as JsonTreasure)
    );
  }

  throw new JsonDeserializeError('Given object is not a valid JsonTile', obj);
}

/**
 * Serializes the given Tile to a JSON representation
 */
export function serializeTile(tile: Tile): JsonTile {
  return {
    tilekey: tile.connector,
    '1-image': tile.treasure.gems[0],
    '2-image': tile.treasure.gems[1],
  };
}

export type JsonColor = string;

/**
 * Converts the given object to a Color, throwing an error if
 * input is malformed or invalid
 */
export function deserializeColor(obj: unknown): Color {
  if (isString(obj)) {
    return new Color(obj);
  }

  throw new JsonDeserializeError('Given object is not a valid Color', obj);
}

export interface JsonPlayer {
  current: JsonCoordinate;
  home: JsonCoordinate;
  color: JsonColor;
}

/**
 * Converts the given object to a Player, throwing an error if
 * input is malformed or invalid
 */
export function deserializeAvatar(obj: unknown): PublicPlayerState {
  if (isNonNullObject(obj) && 'current' in obj && 'home' in obj && 'color' in obj) {
    const typedObj = obj as Record<'current' | 'home' | 'color', unknown>;

    return {
      color: deserializeColor(typedObj.color),
      position: deserializeCoordinate(typedObj.current),
      home: deserializeCoordinate(typedObj.home),
    };
  }
  throw new JsonDeserializeError('Given object is not a valid Player', obj);
}

export type JsonDirection = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

/**
 * Converts the given object to a Direction, throwing an error if
 * input is malformed or invalid
 */
export function deserializeDirection(obj: unknown): Direction {
  if (isString(obj)) {
    switch (obj) {
      case 'LEFT':
        return HorizontalDirection.LEFT;
      case 'RIGHT':
        return HorizontalDirection.RIGHT;
      case 'UP':
        return VerticalDirection.UP;
      case 'DOWN':
        return VerticalDirection.DOWN;
    }
  }

  throw new JsonDeserializeError('Given object is not a valid Direction', obj);
}

/**
 * Serializes the given direction.
 */
export function serializeDirection(direction: Direction): JsonDirection {
  switch (direction) {
    case HorizontalDirection.LEFT:
      return 'LEFT';
    case HorizontalDirection.RIGHT:
      return 'RIGHT';
    case VerticalDirection.UP:
      return 'UP';
    case VerticalDirection.DOWN:
      return 'DOWN';
  }
}

export type JsonSlideAction = null | [number, JsonDirection];

/**
 * Converts the given object to a {@link SlideAction}, throwing an error if
 * input is malformed or invalid
 */
export function deserializeSlideAction(obj: unknown): SlideAction | undefined {
  if (obj === null) {
    return undefined;
  }

  if (isArrayOfLength(obj, 2)) {
    if (isNumber(obj[0]))
      return {
        index: obj[0],
        direction: deserializeDirection(obj[1]),
      };
  }

  throw new JsonDeserializeError('Given object is not a valid Action', obj);
}

export function serializeSlideAction(action?: SlideAction): JsonSlideAction {
  return action === undefined ? null : [action.index, action.direction];
}

export interface JsonState {
  board: JsonBoard;
  spare: JsonTile;
  plmt: JsonPlayer[];
  last: JsonSlideAction;
}

/**
 * Converts the given object to a State, throwing an error if
 * input is malformed or invalid
 */
export function deserializeState(
  obj: unknown,
  goals?: Array<Coordinate>,
  goal?: Coordinate
): GameState {
  assertHasKeys(obj, ['board', 'spare', 'plmt', 'last']);
  const typedObj = obj as Record<'board' | 'spare' | 'plmt' | 'last', unknown>;

  const spare = deserializeTile(typedObj.spare);
  const board = deserializeBoard(typedObj.board);
  const lastAction = deserializeSlideAction(typedObj.last);
  if (isArray(typedObj.plmt)) {
    const avatars = typedObj.plmt.map(p => {
      return deserializeAvatar(p);
    });

    let info = ImmutableMap<Color, PrivatePlayerInfo>();
    for (let idx = 0; idx < avatars.length; idx++) {
      const avatar = avatars[idx];
      const playerGoal = goals?.[idx] ?? goal ?? new Coordinate({ row: 1, column: 1 });
      info = info.set(avatar.color, {
        goto: playerGoal,
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    return new BasicGameState(avatars, board, spare, info, lastAction);
  }

  throw new JsonDeserializeError('Given object is not a valid State', obj);
}

export type JsonDegree = 0 | 90 | 180 | 270;

/**
 * Converts the given object to an index, throwing an error if the input
 * is malformed or invalid
 */
export function deserializeIndex(obj: unknown): number {
  if (isNumber(obj) && NumUtil.isNatural(obj)) {
    return obj;
  }
  throw new JsonDeserializeError('Given object is not a valid index', obj);
}

/**
 * Converts the given object to a State, throwing an error if
 * input is malformed or invalid
 */
export function deserializeDegrees(obj: unknown): 0 | 90 | 180 | 270 {
  if (isNumber(obj)) {
    if (obj === 0 || obj === 90 || obj === 180 || obj === 270) {
      return obj;
    }
  }
  throw new JsonDeserializeError('Given object is not a valid Degree', obj);
}

export function serializeState(state: GameState): JsonState {
  return serializeStateByParams(
    state.getBoard(),
    state.getSpareTile(),
    state.getPlayerStates(),
    state.getLastSlideAction()
  );
}

export function serializeStateByParams(
  board: Board,
  spareTile: Tile,
  players: readonly PublicPlayerState[],
  lastSlideAction?: SlideAction
): JsonState {
  const testBoard = serializeBoard(board);
  const testPlayers = players.map(player => {
    return {
      current: serializeCoordinate(player.position),
      home: serializeCoordinate(player.home),
      color: player.color.color,
    };
  });

  return {
    board: testBoard,
    spare: serializeTile(spareTile),
    plmt: testPlayers,
    last: serializeSlideAction(lastSlideAction),
  };
}
