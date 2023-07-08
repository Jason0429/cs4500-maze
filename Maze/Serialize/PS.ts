import {
  deserializeStrategyDesignation,
  JsonStrategyDesignation,
} from './Strategy';
import {BasicPlayer, Player} from '../Players/Player';
import {
  isArray,
  isArrayOfLength,
  isString,
  JsonDeserializeError,
} from './utils';
import {createStrategy} from '../Players/Strategy';
import {BadPlayer, BadPlayer2} from '../test_utility/BadPlayer';
import {deserializeBadFM, deserializeBadPSCount} from './BadPS';

/**
 * PS is a JSON array of two elements:
 * - Name: string of at least one and at most 20 alpha-numeric characters, i.e.,
 *  it also matches the regular expression "^[a-zA-Z0-9]+$".
 * - Strategy: string that's value is either Riemann or Euclid
 */
export type JsonPS = [string, JsonStrategyDesignation];

const nameRegex = /^[a-zA-Z0-9]+$/;

function deserializeName(obj: unknown): string {
  if (isString(obj)) {
    const len = obj.length;
    const validLen = len >= 1 && len <= 20;
    if (validLen && nameRegex.test(obj)) {
      return obj;
    }
  }

  throw new JsonDeserializeError('Invalid Name provided', obj);
}

export function deserializePS(obj: unknown): Player {
  if (isArrayOfLength(obj, 2)) {
    const name = deserializeName(obj[0]);
    const strategyType = deserializeStrategyDesignation(obj[1]);
    const strategy = createStrategy(strategyType);
    return new BasicPlayer(name, strategy);
  }

  throw new JsonDeserializeError('Invalid input given for PS', obj);
}

/**
 * Deserializes any test-based PS object;
 * Throws an error if invalid
 */
export function deserializeTestPS(obj: unknown): Player {
  if (isArray(obj) && obj.length >= 2) {
    const basePlayer = deserializePS([obj[0], obj[1]]);

    if (obj.length === 2) {
      return basePlayer;
    } else if (obj.length === 3) {
      return new BadPlayer(basePlayer, deserializeBadFM(obj[2]));
    } else if (obj.length === 4) {
      return new BadPlayer2(
        basePlayer,
        deserializeBadFM(obj[2]),
        deserializeBadPSCount(obj[3])
      );
    } else {
      throw new Error(
        'Support for JsonPlayer of length > 3 not implemented yet'
      );
    }
  }

  throw new JsonDeserializeError('Invalid input given for PS', obj);
}
