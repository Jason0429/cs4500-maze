import { Action, ActionType } from '../Common/Action';
import {StrategyType} from '../Players/Strategy';
import { JsonCoordinate, serializeCoordinate } from './Board';
import { JsonDirection, JsonDegree, serializeDirection } from './GameState';

export type JsonStrategyDesignation = 'Euclid' | 'Riemann';

export type JsonChoice = 'PASS' | [number, JsonDirection, JsonDegree, JsonCoordinate];

/**
 * Converts the given object to a StrategyType, throwing an error if
 * input is malformed or invalid
 */
export function deserializeStrategyDesignation(obj: unknown): StrategyType {
  if (typeof obj === 'string') {
    switch (obj) {
      case 'Euclid':
        return StrategyType.EUCLID;
      case 'Riemann':
        return StrategyType.RIEMANN;
    }
  }
  throw new Error('Invalid strategy designation')
}

/**
 * Serializes the given Action to a JSON representation
 */
export function serializeAction(action: Action): JsonChoice {
  switch (action.type) {
    case ActionType.PASS:
      return 'PASS';
    case ActionType.MOVE:
      return [
        action.slideAction.index,
        serializeDirection(action.slideAction.direction),
        action.slideAction.rotations * 90 as JsonDegree,
        serializeCoordinate(action.moveTo)
      ];
  }
}
