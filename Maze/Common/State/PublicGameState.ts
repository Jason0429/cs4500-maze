import {Board} from '../Board/Board';
import {SlideAction, slideActionsAreOpposites, SlideActionWithRotation} from '../Board/SlideAction';
import {Set} from 'immutable';
import {PublicPlayerState} from '../PublicPlayerState';
import {Tile} from '../Tile/Tile';
import {Coordinate} from '../Board/Coordinate';
import {ErrorCode, LabyrinthError} from '../LabyrinthError';
import {oppositeDirection, HorizontalDirection, VerticalDirection} from '../Direction';
import {NumUtil} from '../../Utility/Number';
import {Color} from '../../Utility/Color';
import {Action, ActionType} from '../Action';
import {enforceHomeImmovability, enforceUniqueHomes} from '../../test_utility/General';

/**
 * A PublicGameState contains a limited subset of information about a game's state.
 * Only publically-available knowledge (ie. known to all players) is exposed.
 */
export interface PublicGameState {
  /**
   * Returns the spare {@link Tile} in the current state of the game.
   */
  getSpareTile: () => Tile;

  /**
   * Returns the {@link Board} in the current state of the game.
   */
  getBoard: () => Board;

  /**
   * Returns the {@link PublicPlayerState} related to the {@link Player} whose turn it currently is.
   */
  getActivePlayerState: () => PublicPlayerState;

  /**
   * Retrieves all the {@link PublicPlayerState}s in the current state of the game.
   */
  getPlayerStates: () => PublicPlayerState[];

  /**
   * Retrieves the last {@link SlideAction} executed in the game.
   * If no move has been executed yet, returns `undefined`.
   */
  getLastSlideAction: () => SlideAction | undefined;

  /**
   * Make the next {@link PublicPlayerState} in the queue the active one.
   *
   * @throws if there are no players left
   */
  setNextActivePlayer: () => void;

  /**
   * Retrieves all {@link Coordinate}s reachable by the currently-active player
   * after executing the given {@link SlideAction}.
   *
   * @throws if the given action undoes the previous action.
   */
  activePlayerCanMoveTo: (slideAction: SlideActionWithRotation) => Set<Coordinate>;

  /**
   * Executes the given {@link SlideActionWithRotation} on this state, then executes
   * a callback on the altered game state, saving the result.
   * The {@link SlideActionWithRotation} is undone, and the callback result is returned.
   *
   * Invariant: This {@link GameState} will remain the same before
   * and after execution of this method.
   *
   * @param slideAction - the action to execute on the current game state
   * @param callback - the callback to execute after executing the action
   */
  trySlideActionAndUndo: <T>(
    slideAction: SlideActionWithRotation,
    callback: (state: PublicGameState) => T
  ) => T;

  /**
   * Determines if the avatar with the given {@link Color} is on its home tile.
   */
  isPlayerOnHome: (playerColor: Color) => boolean;

  /**
   * Executes the given {@link Action} on this state, mutating it.
   * Note that the active player remains unchanged after executing this method.
   */
  executeAction: (action: Action) => void;

  /**
   * Removes the {@link PublicPlayerState} associated with the given {@link Color},
   * changing the currently-active player to the next in the queue if necessary.
   *
   * @throws if there are no players left
   */
  kickPlayer: (playerColor: Color) => void;
}

/**
 * Represents a basic implementation of a {@link PublicGameState}.
 * Yields limited information about a {@link GameState}.
 */
export class BasicPublicGameState implements PublicGameState {
  private readonly board: Board;
  private playerStates: PublicPlayerState[];
  private lastAction: SlideAction | undefined;
  private spareTile: Tile;

  public constructor(
    playerStates: PublicPlayerState[],
    board: Board,
    spareTile: Tile,
    lastAction?: SlideAction
  ) {
    this.board = board;
    this.spareTile = spareTile;
    this.ensurePlayerStatesValid(playerStates);
    this.playerStates = playerStates;
    this.lastAction = lastAction;
  }

  /**
   * Ensures that the given array of {@link PublicPlayerState}:
   * - Have a position and home {@link Coordinate} within the bounds of the {@link Board}
   * - Have unique {@link Color}s
   * Optionally ensures that the {@link PublicPlayerState}s:
   * - Have homes on immovable {@link Tile}s
   * - Have mutually-distinct home {@link Tile}s
   */
  private ensurePlayerStatesValid(playerStates: PublicPlayerState[]): void {
    /**
     * Uses env variables to determine if we should enforce optional requirements.
     * Allows us to keep using older integration tests.
     */
    if (enforceUniqueHomes()) {
      this.ensureUniqueHomes(playerStates);
    }
    if (enforceHomeImmovability()) {
      this.ensureImmovableHomes(playerStates);
    }
    this.ensurePlayersInBoard(playerStates);
    this.ensureUniqueAvatarColors(playerStates);
  }

  /**
   * Ensures that all given {@link PublicPlayerState}s have home {@link Tile}s
   * which are on immovable tiles.
   */
  private ensureImmovableHomes(playerStates: PublicPlayerState[]) {
    if (playerStates.some(player => this.getBoard().isCoordinateMoveable(player.home))) {
      throw new LabyrinthError({
        message: 'One or more provided avatars homes are on a moveable tile.',
        code: ErrorCode.AVATAR_OUT_OF_RANGE,
      });
    }
  }

  /**
   * Ensures that all given {@link PublicPlayerState}s have home {@link Tile}s
   * and current position {@link Coordinate}s which are within the bounds of this {@link Board}.
   */
  private ensurePlayersInBoard(playerStates: PublicPlayerState[]) {
    const boardSize = this.getBoard().size;

    const positionsInBoard = playerStates.every(player => {
      return boardSize.isCoordinateInRange(player.position);
    });
    const homesInBoard = playerStates.every(player => {
      return boardSize.isCoordinateInRange(player.home);
    });

    if (!positionsInBoard || !homesInBoard) {
      throw new LabyrinthError({
        message: 'One or more provided avatars are not in the board.',
        code: ErrorCode.AVATAR_OUT_OF_RANGE,
      });
    }
  }

  /**
   * Ensures that all given {@link PublicPlayerState}s have unique {@link Color}s
   */
  private ensureUniqueAvatarColors(playerStates: PublicPlayerState[]): void {
    const colorSet = Set<Color>(playerStates.map(player => player.color));
    if (colorSet.size !== playerStates.length) {
      throw new LabyrinthError({
        message: 'Avatar colors must be unique.',
        code: ErrorCode.AVATAR_COLORS_NOT_UNIQUE,
      });
    }
  }

  /**
   * Ensures that all given {@link PublicPlayerState}s have home {@link Tile}s
   * which are mutually distinct.
   */
  private ensureUniqueHomes(playerStates: PublicPlayerState[]): void {
    const homeSet = Set<Coordinate>(playerStates.map(state => state.home));
    if (homeSet.size !== playerStates.length) {
      throw new LabyrinthError({
        message: 'Avatar homes must be unique.',
        code: ErrorCode.AVATAR_HOMES_NOT_UNIQUE,
      });
    }
  }

  /**
   * Ensures that there are players remaining in this game state.
   */
  private ensurePlayersExist() {
    if (this.playerStates.length === 0) {
      throw new LabyrinthError({
        message: 'There are 0 players in the GameState.',
        code: ErrorCode.NO_PLAYERS,
      });
    }
  }

  setNextActivePlayer(): void {
    this.ensurePlayersExist();
    const formerlyActive = this.playerStates.shift()!;
    this.playerStates.push(formerlyActive);
  }

  activePlayerCanMoveTo(slideAction: SlideActionWithRotation): Set<Coordinate> {
    this.ensurePlayersExist();

    return this.trySlideActionAndUndo(slideAction, (state: PublicGameState) => {
      const curPos = state.getActivePlayerState().position;
      return state.getBoard().getAllConnectedTiles(curPos);
    });
  }

  isPlayerOnHome(playerColor: Color): boolean {
    const player = this.findPlayerState(playerColor);
    return player.position.equals(player.home);
  }

  /**
   * Finds the {@link PublicPlayerState} linked to the given {@link Color}.
   * @throws if no such {@link PublicPlayerState} exists.
   */
  private findPlayerState(color: Color): PublicPlayerState {
    this.ensurePlayersExist();
    const playerIdx = this.playerStates.findIndex(player => player.color.equals(color));
    if (playerIdx === -1) {
      throw new LabyrinthError({
        message: `No player was found with color '${color.color}'.`,
        code: ErrorCode.GAME_STATE_UNKNOWN_PLAYER,
      });
    }

    return this.playerStates[playerIdx];
  }

  executeAction(action: Action): void {
    this.ensurePlayersExist();

    if (action.type === ActionType.MOVE) {
      const spareTile = this.spareTile.rotate(action.slideAction.rotations);
      this.executeSlideAction(action.slideAction, spareTile);
      this.moveActivePlayer(action.moveTo);
    }
  }

  /**
   * Executes a {@link SlideAction}, inserting the given {@link Tile} into
   * the newly free spot on the {@link Board}
   */
  private executeSlideAction(slideAction: SlideAction, spareTile: Tile): void {
    if (slideActionsAreOpposites(this.lastAction, slideAction)) {
      throw new LabyrinthError({
        message: 'Board action undoes the previous action.',
        code: ErrorCode.BOARD_ACTION_UNDOES_PREVIOUS,
      });
    }

    this.spareTile = this.board.executeSlideAction(slideAction, spareTile);
    this.moveAvatarsAfterSlide(slideAction);
    this.lastAction = slideAction;
  }

  /**
   * Given a {@link Coordinate} to move to, moves the currently-active
   * player to that {@link Coordinate}.
   */
  private moveActivePlayer(moveTo: Coordinate): void {
    this.ensurePlayersExist();

    const player = this.getActivePlayerState();
    if (player.position.equals(moveTo)) {
      throw new LabyrinthError({
        message: 'Unable to move player to same position.',
        code: ErrorCode.PLAYER_MOVE_SAME_POSITION,
      });
    }

    if (!this.board.canReachCoordinate(player.position, moveTo)) {
      throw new LabyrinthError({
        message: 'Player cannot move to a non-connected tile.',
        code: ErrorCode.PLAYER_CANNOT_MOVE_TO_TILE,
      });
    }

    player.position = moveTo;
  }

  public kickPlayer(playerColor: Color): void {
    this.ensurePlayersExist();
    this.playerStates = this.playerStates.filter(p => p.color !== playerColor);
  }

  public getActivePlayerState(): PublicPlayerState {
    this.ensurePlayersExist();
    return this.playerStates[0];
  }

  public getPlayerStates(): PublicPlayerState[] {
    return this.playerStates;
  }

  public getLastSlideAction(): SlideAction | undefined {
    return this.lastAction;
  }

  public getSpareTile() {
    return this.spareTile;
  }

  public getBoard() {
    return this.board;
  }

  public trySlideActionAndUndo<T>(
    slideAction: SlideActionWithRotation,
    callback: (state: PublicGameState) => T
  ): T {
    this.ensurePlayersExist();

    const lastAction = this.lastAction;
    const originalSpare = this.spareTile;
    const rotatedSpare = this.spareTile.rotate(slideAction.rotations);
    this.executeSlideAction(slideAction, rotatedSpare);

    const result = callback(this);

    const oppositeAction: SlideAction = {
      index: slideAction.index,
      direction: oppositeDirection(slideAction.direction),
    };
    this.lastAction = undefined; // so as to not interfere with undoing the move
    this.executeSlideAction(oppositeAction, this.spareTile);
    this.spareTile = originalSpare;
    this.lastAction = lastAction;
    return result;
  }

  /**
   * Given a {@link SlideAction}, moves all the {@link PublicPlayerState}s that
   * were affected by the action.
   */
  private moveAvatarsAfterSlide(slideAction: SlideAction): void {
    this.ensurePlayersExist();

    const avatarsToMove = this.getAvatarsToMove(slideAction);

    switch (slideAction.direction) {
      case HorizontalDirection.LEFT:
        this.moveAvatars(avatarsToMove, 0, -1);
        break;
      case HorizontalDirection.RIGHT:
        this.moveAvatars(avatarsToMove, 0, 1);
        break;
      case VerticalDirection.UP:
        this.moveAvatars(avatarsToMove, -1, 0);
        break;
      case VerticalDirection.DOWN:
        this.moveAvatars(avatarsToMove, 1, 0);
        break;
    }
  }

  /**
   * Determines which {@link PublicPlayerState}s need to be moved after a {@link SlideAction}.
   */
  private getAvatarsToMove(slideAction: SlideAction): PublicPlayerState[] {
    const index = slideAction.index;

    switch (slideAction.direction) {
      case VerticalDirection.UP:
      case VerticalDirection.DOWN:
        return this.playerStates.filter(p => p.position.column === index);
      case HorizontalDirection.LEFT:
      case HorizontalDirection.RIGHT:
        return this.playerStates.filter(p => p.position.row === index);
    }
  }

  /**
   * Moves an array of {@link PublicPlayerState}, shifting the row index by `rowDiff` and the column index
   * by `colDiff`. If the new coordinate is not on the board, the coordinate is normalized.
   */
  private moveAvatars(avatars: PublicPlayerState[], rowDiff: number, colDiff: number): void {
    for (const avatar of avatars) {
      const rawRow = avatar.position.row + rowDiff;
      const rawCol = avatar.position.column + colDiff;

      const newRow = NumUtil.mod(rawRow, this.board.size.rows);
      const newCol = NumUtil.mod(rawCol, this.board.size.columns);

      avatar.position = new Coordinate({row: newRow, column: newCol});
    }
  }
}
