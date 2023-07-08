import {BasicBoard, Board} from '../../Common/Board/Board';
import {HorizontalDirection, VerticalDirection} from '../../Common/Direction';
import {ErrorCode, LabyrinthError} from '../../Common/LabyrinthError';
import {SlideAction} from '../../Common/Board/SlideAction';
import {BasicTile, Tile} from '../../Common/Tile/Tile';
import {
  BoardUtils,
  board1,
  board2,
  board1ConnectionMap,
  board1_move1,
  board1_move2,
  board2ConnectionMap,
  board2_move1,
  board2_move2,
  board3,
  board4,
  TestBoardRep,
  board1_spare_tile,
  board2_spare_tile,
  board5,
} from '../../test_utility/BoardUtils';
import {Gem, GemPair} from '../../Common/Tile/Gem';
import {
  deserializeBoard,
  deserializeTreasure,
  JsonBoard,
} from '../../Serialize/Board';
import {deserializeTile, JsonTile} from '../../Serialize/GameState';
import {Random} from '../../Utility/Random';
import {TILE_RIGHT_DOWN, TILE_LEFT_DOWN} from '../Tile/Tiles';
import {assertTileEqual} from '../Tile/Tile.test';
import { Coordinate } from '../../Common/Board/Coordinate';
import { GridSize } from '../../Common/Board/GridSize';

export function assertBoardsEqual(
  board1: Board,
  board2: Board,
  ignoreTreasure = false
) {
  expect(board1.size).toEqual(board2.size);

  for (let row = 0; row < board1.size.rows; row++) {
    for (let column = 0; column < board1.size.columns; column++) {
      const board1Tile = board1.getTileByCoordinate(new Coordinate({row, column}));
      const board2Tile = board2.getTileByCoordinate(new Coordinate({row, column}));
      assertTileEqual(board1Tile, board2Tile, ignoreTreasure);
    }
  }
}

describe('Testing BasicBoard constructor', () => {
  test('BasicBoard constructor works', () => {
    expect(() => deserializeBoard(board1)).not.toThrow();
    expect(() => deserializeBoard(board2)).not.toThrow();
  });
  test('BasicBoard constructor rejects irregular grids', () => {
    expect(() => BoardUtils.boardFromTileChars(board3)).toThrow(
      /Dimensions .* zero/
    );

    expect(() => BoardUtils.boardFromTileChars(board4)).toThrow(
      /Dimensions .* zero/
    );
  });

  test('BasicBoard.ensureTreasuresAreUnique (excluding the spare tile)', () => {
    const tiles = [
      [
        new BasicTile('┼', new GemPair(Gem.RUBY, Gem.RUBY)),
        new BasicTile('┼', new GemPair(Gem.RUBY, Gem.RUBY)),
      ],
    ];

    expect(() => new BasicBoard(tiles)).toThrowError(
      'Treasures must be unique'
    );
  });
});

describe('Testing BasicBoard.getTile()', () => {
  const boards: [JsonBoard, JsonTile][] = [
    [board1, board1_spare_tile],
    [board2, board2_spare_tile],
  ];
  boards.forEach((boardRep, i) => {
    test(`board ${i + 1} returns correct tiles`, () => {
      const board = deserializeBoard(boardRep[0]);
      for (let row = 0; row < board.size.rows; row++) {
        for (let column = 0; column < board.size.columns; column++) {
          const tile = board.getTileByCoordinate(new Coordinate({row, column}));
          expect(tile).toEqual(
            new BasicTile(
              boardRep[0].connectors[row][column],
              deserializeTreasure(boardRep[0].treasures[row][column])
            )
          );
        }
      }
    });
  });

  boards.forEach((boardRep, i) => {
    test(`getting tiles out of board ${i + 1} range throws an error`, () => {
      const board = deserializeBoard(boardRep[0]);

      expect(() => {
        board.getAllConnectedTiles(new Coordinate({row: -1, column: 5}));
      }).toThrow(
        new LabyrinthError({
          message:
            'Specified coordinate (row: -1, column: 5) is not in the board range.',
          code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
        })
      );

      expect(() => {
        board.getAllConnectedTiles(new Coordinate({row: 10, column: 20}));
      }).toThrow(
        new LabyrinthError({
          message:
            'Specified coordinate (row: 10, column: 20) is not in the board range.',
          code: ErrorCode.BOARD_INVALID_COORDINATE,
        })
      );

      expect(() => {
        board.getAllConnectedTiles(new Coordinate({row: 5, column: 50}));
      }).toThrow(
        new LabyrinthError({
          message:
            'Specified coordinate (row: 5, column: 50) is not in the board range.',
          code: ErrorCode.BOARD_INVALID_COORDINATE,
        })
      );
    });
  });
});

describe('Testing BasicBoard.getConnectedPositions', () => {
  [
    {board: board1, connectionMap: board1ConnectionMap},
    {board: board2, connectionMap: board2ConnectionMap},
  ].forEach((testingPair, i) => {
    test(`all pairings in board ${i + 1} have correct connections`, () => {
      const board = deserializeBoard(testingPair.board);

      // loop 1: for each tile in the board...
      for (let row = 0; row < board.size.rows; row++) {
        for (let column = 0; column < board.size.columns; column++) {
          const connectedTiles = board.getAllConnectedTiles(
            new Coordinate({row, column})
          );

          // loop 2: check that all other tiles are properly connected/not connected
          for (let row2 = 0; row2 < board.size.rows; row2++) {
            for (let column2 = 0; column2 < board.size.columns; column2++) {
              expect(
                connectedTiles.has(new Coordinate({row: row2, column: column2}))
              ).toBe(
                testingPair.connectionMap[row][column] ===
                  testingPair.connectionMap[row2][column2]
              );
            }
          }
        }
      }
    });
  });
});

describe('Testing BasicBoard.executeSlideAction', () => {
  const move1: SlideAction & {rotations: number} = {
    direction: HorizontalDirection.RIGHT,
    index: 0,
    rotations: 3,
  };

  const move2: SlideAction & {rotations: number} = {
    direction: VerticalDirection.DOWN,
    index: 4,
    rotations: 4,
  };

  const move3: SlideAction & {rotations: number} = {
    direction: VerticalDirection.UP,
    index: 0,
    rotations: 8,
  };

  const move4: SlideAction & {rotations: number} = {
    direction: HorizontalDirection.LEFT,
    index: 0,
    rotations: 2,
  };

  const move5: SlideAction & {rotations: number} = {
    direction: HorizontalDirection.RIGHT,
    index: 1,
    rotations: 2,
  };

  const move6: SlideAction & {rotations: number} = {
    direction: VerticalDirection.UP,
    index: 3,
    rotations: 1,
  };

  const move7: SlideAction & {rotations: number} = {
    direction: HorizontalDirection.LEFT,
    index: 8,
    rotations: 5,
  };

  const move8: SlideAction & {rotations: number} = {
    direction: VerticalDirection.DOWN,
    index: 10,
    rotations: 2,
  };

  const testingSet: [
    Board,
    Tile,
    SlideAction & {rotations: number},
    TestBoardRep
  ][] = [
    [
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      move1,
      board1_move1,
    ],
    [BoardUtils.boardFromTileChars(board1_move1), TILE_LEFT_DOWN, move2, board1_move2],
    [
      deserializeBoard(board2),
      deserializeTile(board2_spare_tile),
      move3,
      board2_move1,
    ],
    [BoardUtils.boardFromTileChars(board2_move1), TILE_RIGHT_DOWN, move4, board2_move2],
  ];

  testingSet.forEach(set => {
    test(`pushing row/col ${set[2].index} ${set[2].direction} produces correct board`, () => {
      const rotatedSpare = set[1].rotate(set[2].rotations);
      const newSpare = set[0].executeSlideAction(set[2], rotatedSpare);
      assertBoardsEqual(set[0], BoardUtils.boardFromTileChars(set[3]), true);
      expect(newSpare.connector).toBe(set[3].spareTile.connector);
    });
  });

  const errorSet: [
    Board,
    Tile,
    SlideAction & {rotations: number},
    LabyrinthError
  ][] = [
    [
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      move5,
      new LabyrinthError({
        message: 'Invalid move: row 1 is not slideable.',
        code: ErrorCode.BOARD_MOVE_INVALID_SELECTION,
      }),
    ],
    [
      deserializeBoard(board2),
      deserializeTile(board2_spare_tile),
      move6,
      new LabyrinthError({
        message: 'Invalid move: column 3 is not slideable.',
        code: ErrorCode.BOARD_MOVE_INVALID_SELECTION,
      }),
    ],
    [
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      move7,
      new LabyrinthError({
        message: 'Invalid move: row 8 is not slideable.',
        code: ErrorCode.BOARD_MOVE_OUT_OF_RANGE,
      }),
    ],
    [
      deserializeBoard(board2),
      deserializeTile(board2_spare_tile),
      move8,
      new LabyrinthError({
        message: 'Invalid move: column 10 is not slideable.',
        code: ErrorCode.BOARD_MOVE_OUT_OF_RANGE,
      }),
    ],
  ];

  errorSet.forEach(set => {
    test(`pushing row/col ${set[2].index} ${set[2].direction} throws ${set[3]}`, () => {
      const spare = set[1].rotate(set[2].rotations);
      expect(() => {
        set[0].executeSlideAction(set[2], spare);
      }).toThrow(set[3]);
    });
  });
});

describe('Testing BasicBoard.size', () => {
  const boards: JsonBoard[] = [board1, board2];
  boards.forEach((board, i) => {
    test(`board ${i + 1} returns correct dimensions`, () => {
      expect(deserializeBoard(board).size).toEqual(
        new GridSize({
          rows: board.connectors.length,
          columns: board.connectors[0].length,
        })
      );
    });
  });
});

describe('Testing BasicBoard shape', () => {
  let random: Random;

  beforeEach(() => {
    random = new Random('test5');
  });

  const expectBoardSize = (gridSize: GridSize) => {
    const board = random.board(gridSize);
    expect(board.size.equals(gridSize)).toBe(true);
  };

  test('0x0', () => {
    expect(() => random.board(new GridSize({rows: 0, columns: 0}))).toThrow(
      /Dimensions .* zero/
    );
  });

  test('0x1', () => {
    expect(() => random.board(new GridSize({rows: 0, columns: 1}))).toThrow(
      /Dimensions .* zero/
    );
  });

  test('1x0', () => {
    expect(() => random.board(new GridSize({rows: 1, columns: 0}))).toThrow(
      /Dimensions .* zero/
    );
  });

  test('3x2', () => {
    expectBoardSize(new GridSize({rows: 3, columns: 2}));
  });

  test('7x1', () => {
    expectBoardSize(new GridSize({rows: 7, columns: 1}));
  });

  test('2x2', () => {
    expectBoardSize(new GridSize({rows: 2, columns: 2}));
  });

  test('8x7', () => {
    expectBoardSize(new GridSize({rows: 8, columns: 7}));
  });
});

test('Testing BasicBoard.canReachCoordinate', () => {
  const board = deserializeBoard(board5);
  expect(
    board.canReachCoordinate(
      new Coordinate({row: 5, column: 3}),
      new Coordinate({row: 1, column: 1})
    )
  ).toBeFalsy();
});
