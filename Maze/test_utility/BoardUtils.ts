import {BasicBoard, Board} from '../Common/Board/Board';
import {BasicTile, getTileMap, Tile} from '../Common/Tile/Tile';
import {Random} from '../Utility/Random';
import {SlideAction} from '../Common/Board/SlideAction';
import {GemPair} from '../Common/Tile/Gem';
import {JsonBoard} from '../Serialize/Board';
import {JsonTile} from '../Serialize/GameState';
import {Connector} from '../Common/Tile/Connector';
import { Coordinate } from '../Common/Board/Coordinate';

export type TestBoardRep = {board: string[]; spareTile: Tile};

export class BoardUtils {
  static printBoard(board: Board) {
    let boardString = '';
    for (let row = 0; row < board.size.rows; row++) {
      for (let column = 0; column < board.size.columns; column++) {
        const curConnector = board.getTileByCoordinate(
          new Coordinate({row, column})
        ).connector;
        boardString += curConnector;
      }
      boardString += '\n';
    }

    console.log(boardString);
    return boardString;
  }

  /**
   * Gets the string representation for each tile
   * @param board
   */
  static retrieveBoardStringTiles(board: Board): [string[][]] {
    const boardStringTiles: string[][] = [];
    for (let row = 0; row < board.size.rows; row++) {
      const rowStringTiles: string[] = [];
      for (let column = 0; column < board.size.columns; column++) {
        const curConnector = board.getTileByCoordinate(
          new Coordinate({row, column})
        ).connector;
        rowStringTiles.push(curConnector);
      }
      boardStringTiles.push(rowStringTiles);
    }

    return [boardStringTiles];
  }

  /**
   * Gets the treasures for each tile
   * @param board
   */
  static retrieveBoardTreasures(board: Board): [GemPair[][]] {
    const treasures: GemPair[][] = [];
    for (let row = 0; row < board.size.rows; row++) {
      const rowStringTiles: GemPair[] = [];
      for (let column = 0; column < board.size.columns; column++) {
        const curTreasure: GemPair = board.getTileByCoordinate(
          new Coordinate({row, column})
        ).treasure;
        rowStringTiles.push(curTreasure);
      }
      treasures.push(rowStringTiles);
    }

    return [treasures];
  }

  static boardFromTileChars(boardSet: TestBoardRep): BasicBoard {
    const random = new Random('test1');
    return new BasicBoard(
      boardSet.board.map((row, _i) =>
        (row.split('') as Connector[]).map(
          (tile, _j) => getTileMap(random.gemPair()).get(tile)!
        )
      )
    );
  }

  private static tileEqual(
    tile: Tile,
    otherTile: Tile,
    ignoreTreasure = false
  ) {
    otherTile = new BasicTile(
      otherTile.connector,
      ignoreTreasure ? tile.treasure : otherTile.treasure
    );

    return tile.equals(otherTile);
  }

  static boardGridTilesEqual(
    board1: Board,
    board2: Board,
    ignoreTreasure = false
  ) {
    if (!board1.size.equals(board2.size)) return false;
    for (let row = 0; row < board1.size.rows; row++) {
      for (let column = 0; column < board1.size.columns; column++) {
        const board1Tile = board1.getTileByCoordinate(new Coordinate({row, column}));
        const board2Tile = board2.getTileByCoordinate(new Coordinate({row, column}));

        if (!this.tileEqual(board1Tile, board2Tile, ignoreTreasure)) {
          return false;
        }
      }
    }
    return true;
  }

  static slideActionEqual(
    action1: SlideAction,
    action2: SlideAction
  ) {
    return (
      action1.index === action2.index &&
      action1.direction === action2.direction
    );
  }

  static boardAllTilesEqual(board1: Board, board2: Board) {
    return this.boardGridTilesEqual(board1, board2);
  }
}

/**
 * Test boards and associated connection maps.
 * In a connection map, two tiles have the same symbol iff they can connect to each other.
 */

export const board1: JsonBoard = {
  connectors: [
    ['┌', '─', '─', '─', '─', '─', '┐'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['└', '─', '─', '─', '─', '─', '┘'],
  ],
  treasures: [
    [
      ['green-beryl', 'gray-agate'],
      ['emerald', 'moonstone'],
      ['purple-spinel-trillion', 'pink-round'],
      ['yellow-heart', 'green-beryl-antique'],
      ['spinel', 'rose-quartz'],
      ['yellow-heart', 'spinel'],
      ['apricot-square-radiant', 'green-aventurine'],
    ],
    [
      ['rock-quartz', 'morganite-oval'],
      ['cordierite', 'apatite'],
      ['aventurine', 'alexandrite'],
      ['orange-radiant', 'carnelian'],
      ['citrine', 'dumortierite'],
      ['white-square', 'australian-marquise'],
      ['purple-square-cushion', 'raw-beryl'],
    ],
    [
      ['purple-square-cushion', 'blue-pear-shape'],
      ['peridot', 'pink-emerald-cut'],
      ['fancy-spinel-marquise', 'mexican-opal'],
      ['color-change-oval', 'lemon-quartz-briolette'],
      ['black-obsidian', 'color-change-oval'],
      ['yellow-jasper', 'padparadscha-oval'],
      ['ruby', 'prasiolite'],
    ],
    [
      ['peridot', 'purple-spinel-trillion'],
      ['goldstone', 'yellow-heart'],
      ['gray-agate', 'yellow-jasper'],
      ['moss-agate', 'gray-agate'],
      ['tigers-eye', 'magnesite'],
      ['sphalerite', 'chrysoberyl-cushion'],
      ['tourmaline-laser-cut', 'tourmaline-laser-cut'],
    ],
    [
      ['ruby-diamond-profile', 'zircon'],
      ['blue-pear-shape', 'amethyst'],
      ['raw-beryl', 'diamond'],
      ['alexandrite', 'padparadscha-sapphire'],
      ['green-beryl-antique', 'apricot-square-radiant'],
      ['moonstone', 'jaspilite'],
      ['raw-beryl', 'purple-spinel-trillion'],
    ],
    [
      ['lapis-lazuli', 'lapis-lazuli'],
      ['hematite', 'dumortierite'],
      ['blue-spinel-heart', 'morganite-oval'],
      ['purple-cabochon', 'apatite'],
      ['purple-spinel-trillion', 'purple-oval'],
      ['unakite', 'apatite'],
      ['black-spinel-cushion', 'red-spinel-square-emerald-cut'],
    ],
    [
      ['black-spinel-cushion', 'ruby'],
      ['red-spinel-square-emerald-cut', 'dumortierite'],
      ['zircon', 'pink-spinel-cushion'],
      ['black-spinel-cushion', 'hematite'],
      ['moss-agate', 'diamond'],
      ['australian-marquise', 'golden-diamond-cut'],
      ['green-beryl-antique', 'aplite'],
    ],
  ],
};

export const board1_spare_tile: JsonTile = {
  tilekey: '└',
  '1-image': 'jasper',
  '2-image': 'jasper',
};

export const board1_wrap = {
  board: [
    '───│───',
    '│──────',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '└─────┘',
  ],
  gemMap: [
    '┌─────┐',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '└─────┘',
  ],
  spareTile: getTileMap().get('─')!,
};

export const board1_wrap_move = {
  board: [
    '────│──',
    '│──────',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '└─────┘',
  ],
  spareTile: getTileMap().get('─')!,
};

export const board1_move1 = {
  board: [
    '┌┌─────',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '└─────┘',
  ],
  spareTile: getTileMap().get('┐')!,
};

export const board1_move2 = {
  board: [
    '┌┌──┐──',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '└─────┘',
  ],
  spareTile: getTileMap().get('─')!,
};

export const board1ConnectionMap = [
  '0000000',
  '0111110',
  '0222220',
  '0333330',
  '0444440',
  '0555550',
  '0000000',
];

export const board1ShiftLeftRotate0ConnectionMap = [
  '0000007',
  '6111116',
  '6222226',
  '6333336',
  '6444446',
  '6555556',
  '6666666',
];

export const board2: JsonBoard = {
  connectors: [
    ['┌', '─', '─', '─', '─', '─', '┐'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '┐'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['└', '─', '─', '─', '─', '─', '└'],
  ],
  treasures: [
    [
      ['green-beryl', 'gray-agate'],
      ['emerald', 'moonstone'],
      ['purple-spinel-trillion', 'pink-round'],
      ['yellow-heart', 'green-beryl-antique'],
      ['spinel', 'rose-quartz'],
      ['yellow-heart', 'spinel'],
      ['apricot-square-radiant', 'green-aventurine'],
    ],
    [
      ['rock-quartz', 'morganite-oval'],
      ['cordierite', 'apatite'],
      ['aventurine', 'alexandrite'],
      ['orange-radiant', 'carnelian'],
      ['citrine', 'dumortierite'],
      ['white-square', 'australian-marquise'],
      ['purple-square-cushion', 'raw-beryl'],
    ],
    [
      ['purple-square-cushion', 'blue-pear-shape'],
      ['peridot', 'pink-emerald-cut'],
      ['fancy-spinel-marquise', 'mexican-opal'],
      ['color-change-oval', 'lemon-quartz-briolette'],
      ['black-obsidian', 'color-change-oval'],
      ['yellow-jasper', 'padparadscha-oval'],
      ['ruby', 'prasiolite'],
    ],
    [
      ['peridot', 'purple-spinel-trillion'],
      ['goldstone', 'yellow-heart'],
      ['gray-agate', 'yellow-jasper'],
      ['moss-agate', 'gray-agate'],
      ['tigers-eye', 'magnesite'],
      ['sphalerite', 'chrysoberyl-cushion'],
      ['tourmaline-laser-cut', 'tourmaline-laser-cut'],
    ],
    [
      ['ruby-diamond-profile', 'zircon'],
      ['blue-pear-shape', 'amethyst'],
      ['raw-beryl', 'diamond'],
      ['alexandrite', 'padparadscha-sapphire'],
      ['green-beryl-antique', 'apricot-square-radiant'],
      ['moonstone', 'jaspilite'],
      ['raw-beryl', 'purple-spinel-trillion'],
    ],
    [
      ['lapis-lazuli', 'lapis-lazuli'],
      ['hematite', 'dumortierite'],
      ['blue-spinel-heart', 'morganite-oval'],
      ['purple-cabochon', 'apatite'],
      ['purple-spinel-trillion', 'purple-oval'],
      ['unakite', 'apatite'],
      ['black-spinel-cushion', 'red-spinel-square-emerald-cut'],
    ],
    [
      ['black-spinel-cushion', 'ruby'],
      ['red-spinel-square-emerald-cut', 'dumortierite'],
      ['zircon', 'pink-spinel-cushion'],
      ['black-spinel-cushion', 'hematite'],
      ['moss-agate', 'diamond'],
      ['australian-marquise', 'golden-diamond-cut'],
      ['green-beryl-antique', 'aplite'],
    ],
  ],
};

export const board2_spare_tile: JsonTile = {
  tilekey: '┬',
  '1-image': 'jasper',
  '2-image': 'jasper',
};

export const board2_move1 = {
  board: [
    '│─────┐',
    '│─────│',
    '│─────│',
    '│─────┐',
    '│─────│',
    '└─────│',
    '┬─────└',
  ],
  spareTile: getTileMap().get('┌')!,
};

export const board2_move2 = {
  board: [
    '─────┐┘',
    '│─────│',
    '│─────│',
    '│─────┐',
    '│─────│',
    '└─────│',
    '┬─────└',
  ],
  spareTile: getTileMap().get('│')!,
};

export const board2ConnectionMap = [
  '0000000',
  '0111110',
  '0222220',
  '0666666',
  '0444446',
  '0555556',
  '0000006',
];

export const board2_shiftUp_connections0x0 = [
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [true, true, true, true, true, true, false],
];

export const board3 = {
  board: [
    '┌─────┐',
    '│─────│',
    '│────│',
    '│─────┐',
    '│─────│',
    '│─────│',
    '└─────└',
  ],
  spareTile: getTileMap().get('└')!,
};

export const board4 = {
  board: [
    '┌────┐',
    '│────│',
    '│────│',
    '│─────┐',
    '──────│',
    '│─────│',
    '└────└',
  ],
  spareTile: getTileMap().get('┐')!,
};

// board that traps the player no matter where they slide
export const board_trap = {
  board: ['│─│', '│─│', '│─│', '│─│', '│─│'],
  spareTile: getTileMap().get('└')!,
};

// player can reach the goal after a slide
export const board_slide = {
  board: ['│─┐', '│─│', '│─┘', '│─┘', '│─│'],
  spareTile: getTileMap().get('└')!,
};

// player can't reach the goal but can reach the top-left most
export const board_riemann_1 = {
  board: ['│─│', '│─│', '└─│', '│─│', '│─│'],
  spareTile: getTileMap().get('│')!,
};

// player can't reach the goal and can't reach top-left most but can reach the next column
export const board_riemann_2 = {
  board: ['│─│', '│││', '│─│', '│─│', '│─│'],
  spareTile: getTileMap().get('│')!,
};

// player can reach top-left with rotation
export const board_riemann_3 = {
  board: ['└─│', '│─│', '│─│', '│─│', '│─│'],
  spareTile: getTileMap().get('└')!,
};

// player can reach second row
export const board_riemann_4 = {
  board: ['──│', '│─│', '│─│', '│─│', '│─│'],
  spareTile: getTileMap().get('└')!,
};

// Goal 3,1

// Player on 1,2
// Cannot reach 3,1
// Goes to 2,1 by shifting col 2 down, rotating 0
export const euclid_board1 = {
  board: ['┌─────┐', '│─┼└└└│', '│─────│', '│─────│', '└─────┘'],
  spareTile: getTileMap().get('┐')!,
};

// Goal 3,1

// Player on 0,5
// Cannot reach 3,1
// Goes to 3,1 by shifting row 0 right, rotating 0
export const can_reach_goal_1 = {
  board: ['┌────┐┐', '│││││││', '│─────│', '│─────┘', '└─────┘'],
  spareTile: getTileMap().get('┐')!,
};

// Player on 0,5
// Cannot reach 3,1
// Goes to 3,1 by shifting row 0 right, rotating 0
export const can_reach_goal_2 = {
  board: ['└└┌────', '└└└└└└└', '└└└└└└└', '└└└└└└└', '└└└└└└└'],
  spareTile: getTileMap().get('─')!,
};

export const testGameBoard1 = {
  board: [
    '──────┐',
    '└─────│',
    '│─────│',
    '│─────│',
    '│─────│',
    '───────',
    '└─────┘',
  ],

  spareTile: getTileMap().get('┌')!,
};

export const player_board = {
  board: [
    '┌─────┐',
    '│─────│',
    '│─────│',
    '│─────│',
    '│─────┘',
    '│─────│',
    '└─────┘',
  ],
  spareTile: getTileMap().get('└')!,
};

export const bad_board: TestBoardRep = {
  board: [
    '│┼┐└┌┘┬',
    '│┼┼┼┼┼┬',
    '└┼┼┼┼┼┼',
    '│┼┼┼┼┼┬',
    '│┼┼┼┼┼┬',
    '│─┼└┼┼┬',
    '│─┐│┌┘┬',
  ],
  spareTile: getTileMap().get('│')!,
};

export const board5: JsonBoard = {
  connectors: [
    ['─', '─', '┐', '┌', '─', '─', '─'],
    ['└', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['│', '─', '─', '─', '─', '─', '│'],
    ['─', '─', '─', '─', '─', '─', '─'],
    ['└', '─', '─', '─', '─', '─', '┘'],
  ],
  treasures: [
    [
      ['spinel', 'rose-quartz'],
      ['yellow-heart', 'spinel'],
      ['apricot-square-radiant', 'green-aventurine'],
      ['beryl', 'beryl'],
      ['green-beryl', 'gray-agate'],
      ['emerald', 'moonstone'],
      ['purple-spinel-trillion', 'pink-round'],
    ],
    [
      ['rock-quartz', 'morganite-oval'],
      ['cordierite', 'apatite'],
      ['aventurine', 'alexandrite'],
      ['orange-radiant', 'carnelian'],
      ['citrine', 'dumortierite'],
      ['white-square', 'australian-marquise'],
      ['purple-square-cushion', 'raw-beryl'],
    ],
    [
      ['purple-square-cushion', 'blue-pear-shape'],
      ['peridot', 'pink-emerald-cut'],
      ['fancy-spinel-marquise', 'mexican-opal'],
      ['color-change-oval', 'lemon-quartz-briolette'],
      ['black-obsidian', 'color-change-oval'],
      ['yellow-jasper', 'padparadscha-oval'],
      ['ruby', 'prasiolite'],
    ],
    [
      ['peridot', 'purple-spinel-trillion'],
      ['goldstone', 'yellow-heart'],
      ['gray-agate', 'yellow-jasper'],
      ['moss-agate', 'gray-agate'],
      ['tigers-eye', 'magnesite'],
      ['sphalerite', 'chrysoberyl-cushion'],
      ['tourmaline-laser-cut', 'tourmaline-laser-cut'],
    ],
    [
      ['ruby-diamond-profile', 'zircon'],
      ['blue-pear-shape', 'amethyst'],
      ['raw-beryl', 'diamond'],
      ['alexandrite', 'padparadscha-sapphire'],
      ['green-beryl-antique', 'apricot-square-radiant'],
      ['moonstone', 'jaspilite'],
      ['raw-beryl', 'purple-spinel-trillion'],
    ],
    [
      ['lapis-lazuli', 'lapis-lazuli'],
      ['hematite', 'dumortierite'],
      ['blue-spinel-heart', 'morganite-oval'],
      ['purple-cabochon', 'apatite'],
      ['purple-spinel-trillion', 'purple-oval'],
      ['unakite', 'apatite'],
      ['black-spinel-cushion', 'red-spinel-square-emerald-cut'],
    ],
    [
      ['black-spinel-cushion', 'ruby'],
      ['red-spinel-square-emerald-cut', 'dumortierite'],
      ['zircon', 'pink-spinel-cushion'],
      ['black-spinel-cushion', 'hematite'],
      ['moss-agate', 'diamond'],
      ['australian-marquise', 'golden-diamond-cut'],
      ['green-beryl-antique', 'aplite'],
    ],
  ],
};
