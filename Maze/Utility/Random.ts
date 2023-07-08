import {Color} from './Color';
import {GemPair, Gem} from '../Common/Tile/Gem';
import seedrandom = require('seedrandom');
import {BasicTile, Tile} from '../Common/Tile/Tile';
import {BasicBoard, Board} from '../Common/Board/Board';
import {Rules} from '../Common/Rules';
import {ErrorCode, LabyrinthError} from '../Common/LabyrinthError';
import {PublicPlayerState} from '../Common/PublicPlayerState';
import {Connector, CONNECTORS} from '../Common/Tile/Connector';
import {Coordinate} from '../Common/Board/Coordinate';
import {GridSize} from '../Common/Board/GridSize';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { Map as ImmutableMap } from 'immutable';

export class Random {
  private readonly prng: seedrandom.PRNG;

  constructor(seed?: string) {
    this.prng = seedrandom(seed);
  }

  /**
   * Generates a random string with a length of 0 to 6.
   */
  string() {
    return (this.prng() + 1).toString(36).substring(7);
  }

  /**
   * Generates a random number between min and max (inclusive) with an
   * optional parameter to specify the maximum number of decimals.
   */
  range(min: number, max: number, decimals = 0): number {
    return parseFloat((this.prng() * (max - min) + min).toFixed(decimals));
  }

  /**
   * Generates a random hex-code based {@link Color}.
   */
  color(): Color {
    return new Color(this.range(0, 0xffffff).toString(16).toUpperCase().padStart(6, '0'));
  }

  /**
   * Retrieves a random pair of {@link Gem.Gem}.
   *
   * @returns a random {@link Gem.GemPair}
   */
  gemPair(): GemPair {
    const gemArray = Object.values(Gem);
    return new GemPair(
      gemArray[this.range(0, gemArray.length - 1)],
      gemArray[this.range(0, gemArray.length - 1)]
    );
  }

  /**
   * Returns a tile with a random {@link Connector}
   */
  tile(): Tile {
    return new BasicTile(this.connector(), this.gemPair());
  }

  /**
   * Returns a random {@link Connector} that can be used in a tile.
   */
  connector(): Connector {
    return CONNECTORS[this.range(0, CONNECTORS.length - 1)];
  }

  /**
   * Selects a random element from a given list.
   * @param list a list to select from.
   * @returns a random element from the list.
   */
  listElement<T>(list: T[]): T {
    return list[this.range(0, list.length - 1)];
  }

  /**
   * Generates a list of unique immovable coordinates of size numPlayers.
   */
  generateImmovableCoordinate(boardSize: GridSize): Coordinate {
    const [rows, cols] = this.getImmovableRowCol(boardSize);
    const solution: Coordinate[] = this.getPossibleCoordinates(rows, cols);
    return solution[Math.floor(this.prng() * solution.length)];
  }

  /**
   * Generates a list of unique immovable coordinates of size numPlayers.
   */
  generateImmovableCoordinates(boardSize: GridSize, numPlayers: number): Coordinate[] {
    const [rows, cols] = this.getImmovableRowCol(boardSize);
    const solution: Coordinate[] = this.getPossibleCoordinates(rows, cols);

    if (numPlayers > solution.length)
      throw new LabyrinthError({
        message: 'Too many players on the board.',
        code: ErrorCode.TOO_MANY_PLAYERS,
      });

    return this.shuffle(solution).slice(0, numPlayers);
  }

  private getPossibleCoordinates(rows: number[], cols: number[]) {
    const solution: Coordinate[] = [];
    for (const row of rows) {
      for (const column of cols) {
        solution.push(new Coordinate({row: row, column: column}));
      }
    }
    return solution;
  }

  /**
   * Gets a tuple of lists of immovable rows and columns
   */
  private getImmovableRowCol(boardSize: GridSize): [number[], number[]] {
    const rows = [];
    const cols = [];

    for (let i = 0; i < boardSize.rows; i++) {
      if (!Rules.isRowMoveable(i)) {
        rows.push(i);
      }
    }

    for (let i = 0; i < boardSize.columns; i++) {
      if (!Rules.isColumnMoveable(i)) {
        cols.push(i);
      }
    }

    return [rows, cols];
  }

  avatars(gridSize: GridSize, num: number): PublicPlayerState[] {
    const randomHomes = this.generateImmovableCoordinates(gridSize, num);

    const avatars: PublicPlayerState[] = [];

    for (let i = 0; i < num; i++) {
      avatars.push({
        position: randomHomes[i],
        home: randomHomes[i],
        color: this.color(),
      });
    }

    return avatars;
  }

  avatar(gridSize: GridSize, name: string) {
    const homePos = this.generateImmovableCoordinate(gridSize);
    return {
      position: homePos,
      home: homePos,
      goal: this.generateImmovableCoordinate(gridSize),
      color: this.color(),
      name: name,
      reachedGoal: false,
    };
  }

  board(boardSize: GridSize): Board {
    const tiles: Tile[][] = [];
    for (let i = 0; i < boardSize.rows; i++) {
      const rowTiles: Tile[] = [];

      for (let j = 0; j < boardSize.columns; j++) {
        rowTiles.push(this.tile());
      }

      tiles.push(rowTiles);
    }
    return new BasicBoard(tiles);
  }

  gameState(boardSize: GridSize, numPlayers: number): GameState {
    const board = this.board(boardSize);
    const avatars = this.avatars(boardSize, numPlayers);

    let info = ImmutableMap<Color, PrivatePlayerInfo>();
    for (const avatar of avatars) {
      info = info.set(avatar.color, {
        goto: this.generateImmovableCoordinate(board.size),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
    return new BasicGameState(avatars, board, this.tile(), info);
  }
  /**
   * Shuffles the array in-place
   * @returns the same array given
   */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const randIdx = Math.floor(this.prng() * (i + 1));
      [arr[i], arr[randIdx]] = [arr[randIdx], arr[i]];
    }
    return arr;
  }
}
