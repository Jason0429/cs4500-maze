import {Coordinate} from '../../Common/Board/Coordinate';
import {GridSize} from '../../Common/Board/GridSize';
import {ErrorCode, LabyrinthError} from '../../Common/LabyrinthError';

describe('constructing invalid gridSizes', () => {
  const rowCols: [number, number][] = [
    [0, -1],
    [-1, 1],
    [-2, -4],
    [0, 1.2],
    [-4.9, 3],
  ];

  for (const rowCol of rowCols) {
    test(`Coordinate (${rowCol[0]}, ${rowCol[1]}) is invalid`, () => {
      expect(() => new GridSize({rows: rowCol[0], columns: rowCol[1]})).toThrow(
        new LabyrinthError({
          message: 'GridSize rows and columns must be natural numbers.',
          code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
        })
      );
    });
  }
});

describe('constructing valid gridSizes', () => {
  const rowCols: [number, number][] = [
    [0, 1],
    [3, 1],
    [2, 4],
    [0, 2],
    [3, 0],
  ];

  for (const rowCol of rowCols) {
    test(`GridSize (${rowCol[0]}, ${rowCol[1]}) is valid`, () => {
      const grid = new GridSize({rows: rowCol[0], columns: rowCol[1]});
      expect(grid.rows).toBe(rowCol[0]);
      expect(grid.columns).toBe(rowCol[1]);
    });
  }

  test('can check if a coordinate is in range', () => {
    const coord = (row: number, column: number) =>
      new Coordinate({row, column});

    const grid = new GridSize({rows: 5, columns: 2});
    expect(grid.isCoordinateInRange(coord(0, 0))).toBeTruthy();
    expect(grid.isCoordinateInRange(coord(0, 1))).toBeTruthy();
    expect(grid.isCoordinateInRange(coord(4, 0))).toBeTruthy();
    expect(grid.isCoordinateInRange(coord(4, 1))).toBeTruthy();
    expect(grid.isCoordinateInRange(coord(1, 1))).toBeTruthy();

    expect(grid.isCoordinateInRange(coord(5, 0))).toBeFalsy();
    expect(grid.isCoordinateInRange(coord(0, 2))).toBeFalsy();
    expect(grid.isCoordinateInRange(coord(5, 2))).toBeFalsy();
    expect(grid.isCoordinateInRange(coord(99, 999))).toBeFalsy();
  });
});
