/**
 * The Board module is composed of interface and type definitions that relate
 * to the board component of the game Maze.
 *
 * @module Board
 */

import {
  Direction,
  Directions,
  HorizontalDirection,
  VerticalDirection,
} from '../Direction';
import {SlideAction} from './SlideAction';
import {Tile} from '../Tile/Tile';
import {Set} from 'immutable';
import {ErrorCode, LabyrinthError} from '../LabyrinthError';
import {Coordinate} from './Coordinate';
import {GridSize} from './GridSize';

/**
 * A representation of the game board in the game Maze.
 * A board is a rectangular grid of {@link Tile.Tile}s.
 */
export interface Board {
  /**
   * Represents the {@link GridSize} of the current board.
   */
  readonly size: GridSize;

  /**
   * Retrieves the tile {@link Tile.Tile} that corresponds to the {@link Coordinate} given.
   *
   * @throws if the {@link Coordinate} is not on the board.
   */
  getTileByCoordinate: (coordinate: Coordinate) => Tile;

  /**
   * Executes the given {@link SlideAction} on the current board (mutating it).
   *
   * @param action - the move to execute on the current board
   * @param spareTile - the Tile to insert into the newly-opened spot on the board
   * @returns The new spare tile that is the result of executing `move` on the current board
   */
  executeSlideAction: (action: SlideAction, spareTile: Tile) => Tile;

  /**
   * Retrieves a set of {@link Coordinate}s, corresponding to all the {@link Tile.Tile}s that can
   * connect with the {@link Tile.Tile} at the given source {@link Coordinate}.
   */
  getAllConnectedTiles: (src: Coordinate) => Set<Coordinate>;

  /**
   * Given a source and destination {@link Coordinate}, determines if the `dest` is reachable from the `source`.
   */
  canReachCoordinate: (src: Coordinate, dest: Coordinate) => boolean;

  /**
   * Determines if the row at the given index is moveable in this board.
   */
  isRowMoveable: (index: number) => boolean;

  /**
   * Determines if the column at the given index is moveable in this board.
   */
  isColumnMoveable: (index: number) => boolean;

  /**
   * Determines if the given coordinate is moveable in this board (i.e., it is on an movable row or column).
   */
  isCoordinateMoveable: (coordinate: Coordinate) => boolean;
}

/**
 * A basic implementation of {@link Board} in the game Maze.
 */
export class BasicBoard implements Board {
  private tiles: Array<Array<Tile>>;
  public readonly size: GridSize;

  /**
   * Constructs a basic board.
   *
   * @param tiles - the starting tiles of the board
   */
  constructor(tiles: Tile[][]) {
    this.ensureGridIsValid(tiles);
    this.ensureTreasuresAreUnique(tiles);
    this.tiles = tiles.map(row => [...row]);
    this.size = new GridSize({
      rows: this.tiles.length,
      columns: this.tiles[0].length,
    });
  }

  /**
   * Ensures that the given grid is a valid shape (ie. rectangular), and non-empty
   * (ie. has at least one row and at lease one column).
   */
  private ensureGridIsValid(tiles: Tile[][]): void {
    if (
      tiles.length < 1 ||
      tiles.some(row => row.length !== tiles[0].length) ||
      tiles[0].length < 1
    ) {
      throw new LabyrinthError({
        message: 'Dimensions of provided grid are irregular or zero.',
        code: ErrorCode.BOARD_IRREGULAR_DIMENSIONS,
      });
    }
  }

  /**
   * Ensures that no {@link GemPair}s are used more than once in the given grid of {@link Tile.Tile}s
   */
  private ensureTreasuresAreUnique(tiles: Tile[][]): void {
    const gems = tiles.map(tileRow => tileRow.map(tile => tile.treasure)).flat();
    let gemSet = Set();

    for (const gem of gems) {
      if (gemSet.has(gem)) {
        throw new LabyrinthError({
          message: `Treasures must be unique to each tile. ${gem.gems}`,
          code: ErrorCode.TREASURES_NOT_UNIQUE,
        });
      }
      gemSet = gemSet.add(gem);
    }
  }

  public isRowMoveable(index: number): boolean {
    const inRange = 0 <= index && index < this.size.rows;
    return inRange && index % 2 === 0;
  }

  public isColumnMoveable(index: number): boolean {
    const inRange = 0 <= index && index < this.size.columns;
    return inRange && index % 2 === 0;
  }

  public isCoordinateMoveable(coordinate: Coordinate): boolean {
    return this.isRowMoveable(coordinate.row) || this.isColumnMoveable(coordinate.column);
  }

  public getTileByCoordinate(coordinate: Coordinate): Tile {
    const {row, column} = coordinate;
    if (!this.size.isCoordinateInRange(coordinate)) {
      throw new LabyrinthError({
        message: `Specified coordinate (row: ${row}, column: ${column}) is not in the board range.`,
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }
    return this.tiles[row][column];
  }

  /**
   * A utility function to get the `Tile` at the given row index and column index.
   * @throws if the given row/column coordinate is invalid.
   */
  private getTile(row: number, column: number): Tile {
    return this.getTileByCoordinate(new Coordinate({row, column}));
  }

  /**
   * A utility function to set the `Tile` at the given row index and column index.
   * @throws if the given row/column coordinate is invalid.
   */
  private setTile(row: number, column: number, tile: Tile): void {
    this.tiles[row][column] = tile;
  }

  public executeSlideAction(action: SlideAction, spareTile: Tile): Tile {
    const {index, direction} = action;

    switch (direction) {
      case HorizontalDirection.LEFT:
      case HorizontalDirection.RIGHT:
        return this.shiftRowAndReplace(direction, index, spareTile);

      case VerticalDirection.DOWN:
      case VerticalDirection.UP:
        return this.shiftColumnAndReplace(direction, index, spareTile);
    }
  }

  /**
   * Shifts the row at the given index in the given direction, inserting the given spare tile
   * into the newly-free spot. The tile which is removed from the board will be returned
   * (ie. the new spare tile).
   */
  private shiftRowAndReplace(direction: HorizontalDirection, index: number, spareTile: Tile): Tile {
    if (!this.isRowMoveable(index)) {
      throw new LabyrinthError({
        message: `Invalid move: row ${index} is not slideable.`,
        code: ErrorCode.BOARD_MOVE_INVALID_SELECTION,
      });
    }

    switch (direction) {
      case HorizontalDirection.LEFT:
        this.tiles[index].push(spareTile);
        return this.tiles[index].shift()!;

      case HorizontalDirection.RIGHT:
        this.tiles[index].unshift(spareTile);
        return this.tiles[index].pop()!;
    }
  }

  /**
   * Shifts the column at the given index in the given direction, inserting the given spare tile
   * into the newly-free spot. The tile which is removed from the board will be returned
   * (ie. the new spare tile).
   */
  private shiftColumnAndReplace(
    direction: VerticalDirection,
    column: number,
    spareTile: Tile
  ): Tile {
    if (!this.isColumnMoveable(column)) {
      throw new LabyrinthError({
        message: `Invalid move: column ${column} is not slideable.`,
        code: ErrorCode.BOARD_MOVE_INVALID_SELECTION,
      });
    }

    const isSlideUp = direction === VerticalDirection.UP;
    const rowIdxToRemove = isSlideUp ? 0 : this.size.rows - 1;
    const rowIdxToAdd = isSlideUp ? this.size.rows - 1 : 0;

    const newSpareTile = this.getTile(rowIdxToRemove, column);

    switch (direction) {
      case VerticalDirection.UP:
        for (let curRow = 1; curRow < this.size.rows; curRow++) {
          this.setTile(curRow - 1, column, this.getTile(curRow, column));
        }
        break;

      case VerticalDirection.DOWN:
        for (let curRow = this.size.rows - 2; curRow >= 0; curRow--) {
          this.setTile(curRow + 1, column, this.getTile(curRow, column));
        }
        break;
    }

    this.setTile(rowIdxToAdd, column, spareTile);
    return newSpareTile;
  }

  public getAllConnectedTiles(src: Coordinate): Set<Coordinate> {
    if (!this.size.isCoordinateInRange(src)) {
      throw new LabyrinthError({
        message: `Specified coordinate (row: ${src.row}, column: ${src.column}) is not in the board range.`,
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }

    const seenSoFar = Set<Coordinate>();
    return this.getConnectedHelper(src, seenSoFar);
  }

  public canReachCoordinate(src: Coordinate, dest: Coordinate): boolean {
    if (!this.size.isCoordinateInRange(src)) {
      throw new LabyrinthError({
        message: `Specified coordinate (row: ${src.row}, column: ${src.column}) is not in the board range.`,
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }

    const seenSoFar = Set<Coordinate>();
    // If at any point our search determines that `dest` is reachable, the method
    // will immediately terminate, doing no extra work
    const reachable = this.getConnectedHelper(src, seenSoFar, dest);
    return reachable.has(dest);
  }

  /**
   * Returns a set of Coordinates containing all of the Coordinates to
   * which the source can connect.
   *
   * Optionally takes a goal. If this goal is in the set of Coordinates already seen,
   * the method terminates, doing no unecessary work.
   */
  private getConnectedHelper(
    src: Coordinate,
    seenSoFar: Set<Coordinate>,
    goal?: Coordinate
  ): Set<Coordinate> {
    if (goal !== undefined && seenSoFar.has(goal)) {
      return seenSoFar;
    }

    seenSoFar = seenSoFar.add(src);

    const curTile = this.getTileByCoordinate(src);

    for (const direction of Directions) {
      const neighbor = this.getCoordinateInDirection(src, direction);
      if (!seenSoFar.has(neighbor) && this.size.isCoordinateInRange(neighbor)) {
        const neighborTile = this.getTileByCoordinate(neighbor);

        if (curTile.canConnectToTile(neighborTile, direction)) {
          seenSoFar = seenSoFar.union(this.getConnectedHelper(neighbor, seenSoFar, goal));
        }
      }
    }

    return seenSoFar;
  }

  /**
   * Gets the neighboring Coordinate in the given direction from an origin location.
   * The returned coordinate may or may not be on this Board.
   */
  private getCoordinateInDirection(origin: Coordinate, direction: Direction): Coordinate {
    switch (direction) {
      case VerticalDirection.UP:
        return new Coordinate({row: origin.row - 1, column: origin.column});
      case VerticalDirection.DOWN:
        return new Coordinate({row: origin.row + 1, column: origin.column});
      case HorizontalDirection.RIGHT:
        return new Coordinate({row: origin.row, column: origin.column + 1});
      case HorizontalDirection.LEFT:
        return new Coordinate({row: origin.row, column: origin.column - 1});
    }
  }
}
