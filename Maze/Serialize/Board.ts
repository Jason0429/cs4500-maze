import {BasicBoard, Board} from '../Common/Board/Board';
import { Coordinate } from '../Common/Board/Coordinate';
import { Connector, CONNECTORS } from '../Common/Tile/Connector';
import {Gem, GemPair} from '../Common/Tile/Gem';
import {BasicTile, Tile} from '../Common/Tile/Tile';
import {NumUtil} from '../Utility/Number';
import {
  isArrayOfLength,
  isArray,
  isEnumMember,
  isNumber,
  isString,
  JsonDeserializeError,
  isNonNullObject,
} from './utils';


export interface JsonCoordinate {
  'row#': number;
  'column#': number;
}

/**
 * Checks if the given object is a JsonCoordinate
 */
function isJsonCoordinate(obj: unknown): obj is JsonCoordinate {
  if (isNonNullObject(obj) && 'row#' in obj && 'column#' in obj) {
    // TS isn't smart enough to know we just checked that
    const typedObj = obj as Record<'row#' | 'column#', unknown>;
    if (isNumber(typedObj['column#']) && isNumber(typedObj['row#'])) {
      return (
        NumUtil.isNatural(typedObj['column#']) &&
        NumUtil.isNatural(typedObj['row#'])
      );
    }
  }

  return false;
}

/**
 * Converts the given object to a Coordiante if it is a valid JsonCoordinate.
 * Throws an error otherwise.
 */
export function deserializeCoordinate(obj: unknown): Coordinate {
  if (isJsonCoordinate(obj)) {
    return new Coordinate({row: obj['row#'], column: obj['column#']});
  }

  throw new JsonDeserializeError('Invalid input given for Coordinate', obj);
}

/**
 * Serializes the given Coordinate to a JSON representation
 */
export function serializeCoordinate(coordinate: Coordinate): JsonCoordinate {
  return {
    'row#': coordinate.row,
    'column#': coordinate.column,
  };
}

/**
 * A `JsonGem` is a union type of all the values in the string enum `Gem`
 * `Gem`'s values are the string representation of gems.
 */
export type JsonGem = `${Gem}`;
export type JsonTreasure = [JsonGem, JsonGem];

/**
 * Checks if the given object is a Gem
 */
export function isGem(obj: unknown): obj is Gem {
  return isString(obj) && isEnumMember(Gem, obj);
}

/**
 * Checks if the given object is a Treasure
 */
export function isTreasure(obj: unknown): obj is JsonTreasure {
  if (isArrayOfLength(obj, 2)) {
    const [gem1, gem2] = obj;
    return isGem(gem1) && isGem(gem2);
  }

  return false;
}

/**
 * Converts the given object to a GemPair if it is a valid Treasure;
 * Throws an error otherwise.
 */
export function deserializeTreasure(obj: unknown): GemPair {
  if (isTreasure(obj)) {
    // We know that the members are `Gem`'s, but due to how TS handles string enums,
    // the type checker doesn't know for sure.
    return new GemPair(obj[0] as Gem, obj[1] as Gem);
  }

  throw new JsonDeserializeError('Invalid input given for Treasure', obj);
}

/**
 * Serializes the given GemPair to a JSON representation
 */
export function serializeGemPair(gemPair: GemPair): JsonTreasure {
  return [...gemPair.gems];
}

/**
 * Checks if the given object is a ConnectorSymbol.
 */
export function isConnector(obj: unknown): obj is Connector {
  if (isString(obj) && obj.length === 1) {
    // CONNECTOR_SYMBOLS is readonly, so if we check for membership using a type not known to be
    // in the array, TS throws us an error. Cast to any for the check.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (CONNECTORS.includes(obj as any)) {
      return true;
    }
  }

  return false;
}

/**
 * Converts the given object to a Connector, throwing an error if
 * input is malformed or invalid
 */
export function deserializeConnector(obj: unknown): Connector {
  if (isConnector(obj)) {
    return obj;
  }
  throw new JsonDeserializeError('Invalid input for Connector', obj);
}

export type JsonMatrix<T> = Array<Array<T>>;

/**
 * Checks if the given object is a non-empty matrix (ie. array of arrays).
 * Makes no constraint on the size of the arrays (besides being non-empty)
 */
function isNonEmptyMatrix(obj: unknown): obj is Array<Array<unknown>> {
  if (isArray(obj)) {
    const rowsNonEmpty = obj.every(row => isArray(row) && row.length > 0);
    return obj.length > 0 && rowsNonEmpty;
  }
  return false;
}

/**
 * Checks if the given object is a JsonMatrix - ie. a matrix which is non-empty,
 * and whose rows are all of equal size.
 */
function isJsonMatrix<T>(
  obj: unknown,
  checker: (x: unknown) => x is T
): obj is JsonMatrix<T> {
  if (isNonEmptyMatrix(obj)) {
    return obj.every(row => {
      const sameRowLengths = row.length === obj[0].length;
      const typeCheck = row.every(x => checker(x));
      return sameRowLengths && typeCheck;
    });
  }
  return false;
}

export interface JsonBoard {
  connectors: JsonMatrix<Connector>;
  treasures: JsonMatrix<JsonTreasure>;
}

/**
 * Checks if the given object is a JsonBoard
 */
function isJsonBoard(obj: unknown): obj is JsonBoard {
  if (isNonNullObject(obj) && 'connectors' in obj && 'treasures' in obj) {
    // TS isn't smart enough to know that we just checked this
    const typedObj = obj as Record<'connectors' | 'treasures', unknown>;
    if (
      isJsonMatrix(typedObj['connectors'], isConnector) &&
      isJsonMatrix(typedObj['treasures'], isTreasure)
    ) {
      return (
        typedObj.connectors.length === typedObj.treasures.length &&
        typedObj.connectors[0].length === typedObj.treasures[0].length
      );
    }
  }
  return false;
}

/**
 * Converts the given object to a Board, throwing an error if
 * input is malformed or invalid
 */
export function deserializeBoard(obj: unknown): Board {
  if (!isJsonBoard(obj)) {
    throw new JsonDeserializeError('Given object is not a valid Board', obj);
  }

  const tiles: Tile[][] = [];
  for (let row = 0; row < obj.connectors.length; row++) {
    const tileRow: Tile[] = [];
    for (let col = 0; col < obj.connectors[row].length; col++) {
      const tile = new BasicTile(
        obj.connectors[row][col],
        deserializeTreasure(obj.treasures[row][col])
      );
      tileRow.push(tile);
    }
    tiles.push(tileRow);
  }

  return new BasicBoard(tiles);
}

/**
 * Serializes the given Board to a JSON representation
 */
export function serializeBoard(board: Board): JsonBoard {
  const tiles: JsonMatrix<Connector> = [];
  const treasures: JsonMatrix<JsonTreasure> = [];

  for (let row = 0; row < board.size.rows; row++) {
    const tileRow: Array<Connector> = [];
    const treasureRow: Array<JsonTreasure> = [];
    for (let column = 0; column < board.size.columns; column++) {
      const tile = board.getTileByCoordinate(new Coordinate({row, column}));
      tileRow.push(tile.connector);
      treasureRow.push(serializeGemPair(tile.treasure));
    }
    tiles.push(tileRow);
    treasures.push(treasureRow);
  }

  return {
    connectors: tiles,
    treasures: treasures,
  };
}
