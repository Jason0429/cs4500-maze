import {
  SlideAction,
  slideActionsAreOpposites,
  SlideActionWithRotation,
} from '../Common/Board/SlideAction';
import {Direction, HorizontalDirections, VerticalDirections} from '../Common/Direction';
import {List, Map} from 'immutable';
import {Action, ActionType, Move} from '../Common/Action';
import {PublicGameState} from '../Common/State/PublicGameState';
import {Color} from '../Utility/Color';
import {Rules} from '../Common/Rules';
import {Coordinate} from '../Common/Board/Coordinate';

/**
 * Represents a strategy to be used by a Player. It should be used to determine what the next move of a player is.
 */
export interface Strategy {
  /**
   * Computes the next action given the information about the game state. The next action could be either
   * a {@link Pass} or a {@link Move}.
   *
   * @param stateInfo
   */
  computeAction: (stateInfo: PublicGameState, goal: Coordinate, playerColor: Color) => Action;
}

/**
 * Represents an abstracted strategy; contains most of the basic behaviors of a strategy.
 */
abstract class AbstractStrategy implements Strategy {
  public computeAction(stateInfo: PublicGameState, goal: Coordinate): Action {
    const reachableAfterActions = this.getReachableFromAllActions(stateInfo);

    if (reachableAfterActions.size === 0) {
      return {type: ActionType.PASS};
    }

    let moveTo;

    if (reachableAfterActions.has(goal)) {
      moveTo = goal;
    } else {
      const reachedCoordinates = reachableAfterActions.keySeq().toArray();
      reachedCoordinates.sort(this.sortByHighestValue(goal));
      moveTo = reachedCoordinates[0];
    }

    const move = reachableAfterActions.get(moveTo)!;

    return move;
  }

  protected getReachableFromAllActions(stateInfo: PublicGameState): Map<Coordinate, Move> {
    const size = stateInfo.getBoard().size;

    let reachableCoordinates: Map<Coordinate, Move> = Map();

    for (let rowIdx = 0; rowIdx < size.rows; rowIdx++) {
      if (Rules.isRowMoveable(rowIdx)) {
        reachableCoordinates = this.getReachableWithSlide(
          reachableCoordinates,
          stateInfo,
          rowIdx,
          HorizontalDirections
        );
      }
    }

    for (let colIdx = 0; colIdx < size.columns; colIdx++) {
      if (Rules.isColumnMoveable(colIdx)) {
        reachableCoordinates = this.getReachableWithSlide(
          reachableCoordinates,
          stateInfo,
          colIdx,
          VerticalDirections
        );
      }
    }

    return reachableCoordinates;
  }

  private getReachableWithSlide(
    coordinatesReached: Map<Coordinate, Move>,
    stateInfo: PublicGameState,
    index: number,
    directions: List<Direction>
  ): Map<Coordinate, Move> {
    for (const direction of directions) {
      const action: SlideAction = {
        direction,
        index,
      };

      const lastAction = stateInfo.getLastSlideAction();
      if (lastAction && slideActionsAreOpposites(lastAction, action)) {
        continue;
      }

      coordinatesReached = this.getReachableWithRotation(
        coordinatesReached,
        stateInfo,
        index,
        direction
      );
    }

    return coordinatesReached;
  }

  private getReachableWithRotation(
    coordinatesReached: Map<Coordinate, Move>,
    stateInfo: PublicGameState,
    index: number,
    direction: Direction
  ): Map<Coordinate, Move> {
    const size = stateInfo.getBoard().size;
    const boardArea = size.rows * size.columns;
    if (coordinatesReached.size === boardArea) {
      return coordinatesReached;
    }

    for (let rotations = 0; rotations < 4; rotations++) {
      const curSlideAction: SlideActionWithRotation = {direction, index, rotations};

      if (!Rules.isSlideActionLegal(stateInfo, curSlideAction)) {
        continue;
      }

      stateInfo.trySlideActionAndUndo(curSlideAction, state => {
        const playerPos = state.getActivePlayerState().position;
        state
          .getBoard()
          .getAllConnectedTiles(playerPos)
          .forEach(coordinate => {
            if (!coordinatesReached.has(coordinate) && !coordinate.equals(playerPos)) {
              coordinatesReached = coordinatesReached.set(coordinate, {
                type: ActionType.MOVE,
                moveTo: coordinate,
                slideAction: curSlideAction,
              });
            }
          });
      });
    }

    return coordinatesReached;
  }

  protected abstract sortByHighestValue(
    goal: Coordinate
  ): (coordinate1: Coordinate, coordinate2: Coordinate) => number;
}

/**
 * Represents the Riemann Strategy. If the current player can reach a goal tile, it will do so; otherwise
 * it chooses the top-most, left-most available tile. If it cannot reach any, it will pass.
 */
export class RiemannStrategy extends AbstractStrategy {
  protected sortByHighestValue(goal: Coordinate): (c1: Coordinate, c2: Coordinate) => number {
    return (c1: Coordinate, c2: Coordinate) => {
      if (c1.equals(goal)) return 1;
      if (c2.equals(goal)) return -1;
      return Coordinate.compareByRowColumn(c1, c2);
    };
  }
}

/**
 * Represents the Euclid Strategy. The current player will also move to the tile closest to the goal.
 * If it cannot reach any, it will pass.
 */
export class EuclidStrategy extends AbstractStrategy {
  protected sortByHighestValue(goal: Coordinate): (c1: Coordinate, c2: Coordinate) => number {
    return (c1, c2) => Coordinate.compareByEuclideanDistanceToGoal(c1, c2, goal);
  }
}

export enum StrategyType {
  EUCLID = 'Euclid',
  RIEMANN = 'Riemann',
}

export function createStrategy(type: StrategyType) {
  switch (type) {
    case StrategyType.EUCLID:
      return new EuclidStrategy();
    case StrategyType.RIEMANN:
      return new RiemannStrategy();
  }
}
