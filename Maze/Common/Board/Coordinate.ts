import {Record} from 'immutable';
import {NumUtil} from '../../Utility/Number';
import {LabyrinthError, ErrorCode} from '../LabyrinthError';

/**
 * An immutable object representing a coordinate, which has a row and a column.
 * Both the row and the column must be natural numbers.
 */
export class Coordinate extends Record({row: 0, column: 0}) {
  static readonly ORIGIN = new Coordinate({row: 0, column: 0});

  /**
   * Compares two {@link Coordinate}s in row-column order.
   * Two coordinates c1 and c2 are in row-column order if:
   * - c1.row < c2.row, or;
   * - c1.row === c2.row, and c1.column < c2.column
   */
  static compareByRowColumn(c1: Coordinate, c2: Coordinate): number {
    const rowDiff = c1.row - c2.row;

    if (rowDiff === 0) {
      return c1.column - c2.column;
    } else {
      return rowDiff;
    }
  }

  /**
   * Compares two {@link Coordinate}s in ascending order of Euclidean distance
   * to a given goal. If the two {@link Coordinate}s are the same distance away,
   * the tie is broken by sorting in row-column order.
   */
  static compareByEuclideanDistanceToGoal(
    c1: Coordinate,
    c2: Coordinate,
    goal: Coordinate
  ): number {
    const distance1 = Coordinate.squaredEuclideanDistance(c1, goal);
    const distance2 = Coordinate.squaredEuclideanDistance(c2, goal);

    if (distance1 === distance2) {
      return Coordinate.compareByRowColumn(c1, c2);
    } else {
      return distance1 - distance2;
    }
  }

  /**
   * Given two {@link Coordinate}s, returns the squared Euclidean distance between them.
   */
  static squaredEuclideanDistance(c1: Coordinate, c2: Coordinate): number {
    const rowDiff = c1.row - c2.row;
    const colDiff = c1.column - c2.column;
    return (rowDiff * rowDiff) + (colDiff * colDiff);
  }

  /**
   * Constructs a two-dimensional coordinate composed of two natural numbers.
   *
   * @param params - an object that contains the row and column positions in a grid.
   */
  constructor(params: {row: number; column: number}) {
    if (!NumUtil.isInteger(params.row) || !NumUtil.isInteger(params.column)) {
      throw new LabyrinthError({
        message: `Invalid coordinate (row: ${params.row}, column: ${params.column}): row and column must be integers.`,
        code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
      });
    }
    super(params);
  }
}
