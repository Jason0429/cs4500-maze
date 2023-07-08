import {Coordinate} from '../../Common/Board/Coordinate';
import {LabyrinthError, ErrorCode} from '../../Common/LabyrinthError';

describe('constructing invalid coordinates', () => {
  const rowCols: [number, number][] = [
    [3.01, -1],
    [-1.2, 1],
    [-2.4, -4],
    [0, 1.2],
    [-4.9, 3],
  ];

  for (const rowCol of rowCols) {
    test(`Coordinate (${rowCol[0]}, ${rowCol[1]}) is invalid`, () => {
      expect(() => new Coordinate({row: rowCol[0], column: rowCol[1]})).toThrow(
        new LabyrinthError({
          message: `Invalid coordinate (row: ${rowCol[0]}, column: ${rowCol[1]}): row and column must be integers.`,
          code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
        })
      );
    });
  }
});

describe('constructing valid coordinates', () => {
  const rowCols: [number, number][] = [
    [0, 1],
    [3, -1],
    [-2, 4],
    [0, 2],
    [3, 0],
  ];

  for (const rowCol of rowCols) {
    test(`Coordinate (${rowCol[0]}, ${rowCol[1]}) is valid`, () => {
      const coord = new Coordinate({row: rowCol[0], column: rowCol[1]});
      expect(coord.row).toBe(rowCol[0]);
      expect(coord.column).toBe(rowCol[1]);
    });
  }
});

describe('sorting Coordinates', () => {
  const c0_0 = new Coordinate({row: 0, column: 0});
  const c0_1 = new Coordinate({row: 0, column: 1});
  const c1_0 = new Coordinate({row: 1, column: 0});
  const c1_1 = new Coordinate({row: 1, column: 1});
  const c2_2 = new Coordinate({row: 2, column: 2});

  const coordinates = [c1_1, c2_2, c0_0, c0_1, c1_0];

  test('row-column order', () => {
    coordinates.sort(Coordinate.compareByRowColumn);
    expect(coordinates).toEqual([c0_0, c0_1, c1_0, c1_1, c2_2]);
  });

  test('euclidean distance to (0, 0)', () => {
    coordinates.sort((c1, c2) =>
      Coordinate.compareByEuclideanDistanceToGoal(c1, c2, c0_0)
    );

    expect(coordinates).toEqual([c0_0, c0_1, c1_0, c1_1, c2_2]);
  });

  test('euclidean distance to (3, 3)', () => {
    coordinates.sort((c1, c2) =>
      Coordinate.compareByEuclideanDistanceToGoal(c1, c2, new Coordinate({ row: 3, column: 3 }))
    );

    expect(coordinates).toEqual([c2_2, c1_1, c0_1, c1_0, c0_0]);
  });
});
