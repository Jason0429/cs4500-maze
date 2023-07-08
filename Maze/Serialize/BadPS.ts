import {JsonPS} from '../Serialize/PS';
import {isNumber, isString, JsonDeserializeError} from './utils';

export type JsonBadFM = 'setUp' | 'takeTurn' | 'win';

export function deserializeBadFM(obj: unknown): JsonBadFM {
  if (isString(obj)) {
    if (obj === 'setUp' || obj === 'takeTurn' || obj === 'win') {
      return obj;
    }
  }

  throw new JsonDeserializeError('Given invalid BadFM', obj);
}

/**
 * PS is a JSON array of two elements:
 * - Name: string of at least one and at most 20 alpha-numeric characters, i.e.,
 *  it also matches the regular expression "^[a-zA-Z0-9]+$".
 * - Strategy: string that's value is either Riemann or Euclid
 *
 * BadPS extends this array with a TestBadFM, indicating in which function
 * this player will throw an exception
 */
export type JsonBadPS = [...JsonPS, JsonBadFM];

export type BadPSCount = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function deserializeBadPSCount(obj: unknown): BadPSCount {
  if (isNumber(obj) && Number.isInteger(obj) && obj >= 1 && obj <= 7) {
    return obj as BadPSCount;
  }

  throw new JsonDeserializeError(
    'Given obj is not an integer between 1 and 7, inclusive',
    obj
  );
}

/**
 * This type expands on TestBadPS, adding a count as the
 * fourth element in the array. A count is a natural number
 * between 1 and 7 (inclusive).
 */
export type JsonBadPS2 = [...JsonBadPS, BadPSCount];

export type JsonBadPlayerSpec = Array<JsonPS | JsonBadPS>;
export type JsonBadPlayerSpec2 = Array<JsonPS | JsonBadPS | JsonBadPS2>;
