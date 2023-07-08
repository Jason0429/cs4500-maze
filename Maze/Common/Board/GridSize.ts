import {Record} from 'immutable';
import {NumUtil} from '../../Utility/Number';
import {LabyrinthError, ErrorCode} from '../LabyrinthError';
import {Coordinate} from './Coordinate';

/**
 * An immutable object that represents the number of rows and columns in a rectangular grid system.
 */
export class GridSize extends Record({rows: 0, columns: 0}) {
  /**
   * Constructs an immutable grid size, composed of two natural numbers.
   *
   * @param params - an object that contains the amount of rows and columns in a grid
   * @throws {LabyrinthError} if either `params.rows` or `params.columns` is not a natural number
   */
  constructor(params: {rows: number; columns: number}) {
    if (!NumUtil.isNatural(params.rows) || !NumUtil.isNatural(params.columns)) {
      throw new LabyrinthError({
        message: 'GridSize rows and columns must be natural numbers.',
        code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
      });
    }
    super(params);
  }

  /**
   * Determines if the given {@link Coordinate} is in range of this GridSize.
   */
  public isCoordinateInRange(c: Coordinate): boolean {
    const rowInRange = 0 <= c.row && c.row < this.rows;
    const colInRange = 0 <= c.column && c.column < this.columns;
    return rowInRange && colInRange;
  }
}
