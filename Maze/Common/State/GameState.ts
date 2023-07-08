import { Map as ImmutableMap } from 'immutable';
import { Board } from '../Board/Board';
import { SlideAction, SlideActionWithRotation } from '../Board/SlideAction';
import { Set } from 'immutable';
import { ErrorCode, LabyrinthError } from '../LabyrinthError';
import { Color } from '../../Utility/Color';
import { PublicPlayerState } from '../PublicPlayerState';
import { Action } from '../Action';
import { enforceGoalImmovability } from '../../test_utility/General';
import { Tile } from '../Tile/Tile';
import { Coordinate } from '../Board/Coordinate';
import { BasicPublicGameState, PublicGameState } from './PublicGameState';

/**
 * Represents a player's information in the game that is not publically available.
 */
export type PrivatePlayerInfo = {
  /**
   * A player's current "goal" location (can be treasure or home location).
   */
  goto: Coordinate;

  /**
   * Determines if the player has reached all of its goal yet
   * (if true, indicates that player should return home).
   */
  hasReachedAllGoals: boolean;

  /**
   * The number of treasures that the player has collected.
   */
  treasuresCollected: number;

  /**
   * Determines if the player has returned home
   * after collecting all of their treasures.
   */
  hasReturnedHome: boolean;
};

/**
 * Represents all information associated with a game of Labyrinth and supports
 * all related operations. The GameState is immutable, meaning that all its fields
 * cannot be changed.
 */
export interface GameState extends PublicGameState {
  /**
   * A list of additional goal {@link Coordinate}s.
   */
  readonly goalSequence: Coordinate[];

  /**
   * Retreives the current game state with only publically-available information.
   */
  getPublicGameState: () => PublicGameState;

  /**
   * Determines whether the active player has reached its goal tile.
   */
  isActivePlayerOnGoal: () => boolean;

  /**
   * Return the goal {@link Coordinate} of the player with the given {@link Color}.
   */
  getPlayerGoal: (playerColor: Color) => Coordinate;

  /**
   * Returns whether or not the player with the given {@link Color} has returned home
   * after collecting all their treasures.
   */
  hasReturnedHome: (playerColor: Color) => boolean;

  /**
   * Indicates whether the player with the given {@link Color} has collected all of
   * their treasures and returned home.
   */
  setPlayerHasReturnedHome: (playerColor: Color, hasReturnedHome: boolean) => void;

  /**
   * Returns the number of treasures collected by the player with the given {@link Color}.
   */
  getNumTreasuresCollected: (playerColor: Color) => number;

  /**
   * Gives the player with the given {@link Color} a new goal location.
   */
  setPlayerGoal: (playerColor: Color, goalLocation: Coordinate) => void;

  /**
   * Sets a boolean indicating if the the player with the given {@link Color} has reached
   * all of its goals.
   */
  setPlayerHasReachedAllGoals: (playerColor: Color, hasReachedAllGoals: boolean) => void;

  /**
   * Increments the player with the given {@link Color}'s number of treasures collected by 1.
   */
  incrementTreasuresCollected: (playerColor: Color) => void;

  /**
   * Determines if the player with the given {@link Color} has reached all of its goals.
   */
  hasPlayerReachedAllGoals: (playerColor: Color) => boolean;
}

/**
 * Represents the entire state of a game of Maze, including public and private components.
 */
export class BasicGameState implements GameState {
  /**
   * A subset of the game state that only includes public information
   * that we delegate method calls to.
   */
  private readonly publicState: PublicGameState;

  /**
   * Maps a player's {@link Color} to a {@link PrivatePlayerInfo}
   * associated with that player.
   */
  private privatePlayerInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  readonly goalSequence: Coordinate[];

  /**
   * @param playerStates - A list of all players to add to this game.
   * @param board - The {@link Board} to play this game on.
   * @param spareTile - The inital spare {@link Tile} of the game.
   * @param privatePlayerInfo - A mapping of a player's {@link Color} to its {@link PrivatePlayerInfo}.
   * @param lastAction - The last board action executed. Note that the last board action could be
   *                     undefined, as the start of the game will not have a board action already
   *                     executed.
   */
  constructor(
    playerStates: PublicPlayerState[],
    board: Board,
    spareTile: Tile,
    privatePlayerInfo: ImmutableMap<Color, PrivatePlayerInfo>,
    lastAction?: SlideAction,
    goalSequence?: Coordinate[]
  ) {
    this.ensurePlayerInfoConsistency(privatePlayerInfo, playerStates);
    this.privatePlayerInfo = privatePlayerInfo;
    this.publicState = new BasicPublicGameState(playerStates, board, spareTile, lastAction);
    this.goalSequence = goalSequence ?? [];


    /**
     * Uses env variables to determine if we should enforce the immovability of goals.
     * Allows us to keep using older integration tests.
     */
    if (enforceGoalImmovability()) {
      this.ensureImmovableGoals(playerStates, board, this.goalSequence);
    }
    this.ensureGoalsOnBoard(playerStates, board, this.goalSequence);
  }

  /**
   * Ensure that the given Map of {@link PrivatePlayerInfo}s and the array of {@link PublicPlayerState}s
   * are consistent.
   */
  private ensurePlayerInfoConsistency(
    privateInfo: ImmutableMap<Color, PrivatePlayerInfo>,
    players: PublicPlayerState[]
  ): void {
    const playerColors = Set<Color>(players.map(p => p.color));

    for (const color of playerColors) {
      if (!privateInfo.has(color)) {
        throw new LabyrinthError({
          message: `Player with color ${color.color} not found in the given privatePlayerInfo`,
          code: ErrorCode.PLAYER_WITH_COLOR_NOT_FOUND,
        });
      }
    }

    const privateInfoColors = Set<Color>(privateInfo.keys());
    for (const color of privateInfoColors) {
      if (!playerColors.has(color)) {
        throw new LabyrinthError({
          message: `Player with color ${color.color} not found in the given list of PublicPlayerStates`,
          code: ErrorCode.PLAYER_WITH_COLOR_NOT_FOUND,
        });
      }
    }
  }

  /**
   * Get the {@link PrivatePlayerInfo} associated with the given {@link Color}.
   */
  private getPrivateInfo(color: Color): PrivatePlayerInfo {
    this.ensurePlayerInfoConsistency(this.privatePlayerInfo, this.getPlayerStates());
    const info = this.privatePlayerInfo.get(color);

    if (info === undefined) {
      throw new LabyrinthError({
        message: `Player with color ${color.color} not found`,
        code: ErrorCode.PLAYER_WITH_COLOR_NOT_FOUND,
      });
    }

    return info;
  }

  public getPlayerGoal(playerColor: Color): Coordinate {
    return this.getPrivateInfo(playerColor).goto;
  }

  public getNumTreasuresCollected(playerColor: Color): number {
    return this.getPrivateInfo(playerColor).treasuresCollected;
  }

  public hasReturnedHome(playerColor: Color): boolean {
    return this.getPrivateInfo(playerColor).hasReturnedHome;
  }

  public setPlayerHasReturnedHome(playerColor: Color, hasReturnedHome: boolean): void {
    this.getPrivateInfo(playerColor).hasReturnedHome = hasReturnedHome;
  }

  public setPlayerGoal(playerColor: Color, goalLocation: Coordinate): void {
    this.getPrivateInfo(playerColor).goto = goalLocation;
  }

  public setPlayerHasReachedAllGoals(playerColor: Color, hasReachedAllGoals: boolean): void {
    this.getPrivateInfo(playerColor).hasReachedAllGoals = hasReachedAllGoals;
  }

  public incrementTreasuresCollected(playerColor: Color): void {
    this.getPrivateInfo(playerColor).treasuresCollected++;
  }

  public hasPlayerReachedAllGoals(playerColor: Color): boolean {
    return this.getPrivateInfo(playerColor).hasReachedAllGoals;
  }

  public getSpareTile(): Tile {
    return this.publicState.getSpareTile();
  }

  public getBoard(): Board {
    return this.publicState.getBoard();
  }

  public getActivePlayerState(): PublicPlayerState {
    return this.publicState.getActivePlayerState();
  }

  public getPlayerStates(): PublicPlayerState[] {
    return this.publicState.getPlayerStates();
  }

  public getLastSlideAction(): SlideAction | undefined {
    return this.publicState.getLastSlideAction();
  }

  public getPublicGameState(): PublicGameState {
    return this.publicState;
  }

  public setNextActivePlayer(): void {
    this.publicState.setNextActivePlayer();
  }

  public activePlayerCanMoveTo(slideAction: SlideActionWithRotation): Set<Coordinate> {
    return this.publicState.activePlayerCanMoveTo(slideAction);
  }

  public isActivePlayerOnGoal(): boolean {
    const player = this.getActivePlayerState();
    return player.position.equals(this.getPlayerGoal(player.color));
  }

  public isPlayerOnHome(playerColor: Color): boolean {
    return this.publicState.isPlayerOnHome(playerColor);
  }

  public executeAction(action: Action): void {
    this.publicState.executeAction(action);
  }

  public trySlideActionAndUndo<T>(
    slideAction: SlideActionWithRotation,
    callback: (state: PublicGameState) => T
  ): T {
    return this.publicState.trySlideActionAndUndo(slideAction, callback);
  }

  public kickPlayer(playerColor: Color): void {
    this.privatePlayerInfo = this.privatePlayerInfo.delete(playerColor);
    this.publicState.kickPlayer(playerColor);
  }

  /**
   * Returns the {@link PublicPlayerState} associated with the given player {@link Color}.
   * @param color the player's {@link Color}.
   */
  private findPlayerState(color: Color): PublicPlayerState {
    const player = this.getPlayerStates().find((player) => player.color.equals(color));
    if (player === undefined) {
      throw new LabyrinthError({
        message: `No player was found with color '${color.color}'.`,
        code: ErrorCode.GAME_STATE_UNKNOWN_PLAYER,
      });
    }

    return player;
  }

  /**
   * Ensures that the goals of the given players are all on immovable tiles.
   * @throws if any goal is not on an immovable tile.
   */
  private ensureImmovableGoals(
    playerStates: PublicPlayerState[],
    board: Board,
    goalSequence: Coordinate[]
  ) {
    const isMovable = (color: Color) => {
      return board.isCoordinateMoveable(this.getPlayerGoal(color));
    };

    if (playerStates.some(player => isMovable(player.color))) {
      throw new LabyrinthError({
        message: 'One or more provided avatars goals are on a moveable tile.',
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }

    if (goalSequence.some((goal) => board.isCoordinateMoveable(goal))) {
      throw new LabyrinthError({
        message: 'One or more provided additional goals are on a moveable tile.',
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }
  }

  /**
   * Ensures that the goals of the given players are all within the bounds of the board.
   * @throws if any goal is not within the dimensions of the given board.
   */
  private ensureGoalsOnBoard(
    playerStates: PublicPlayerState[],
    board: Board,
    goalSequence: Coordinate[]
  ) {
    const goalsInBoard = playerStates.every(player => {
      return board.size.isCoordinateInRange(this.getPlayerGoal(player.color));
    });
    const additionalGoalsInBoard = goalSequence.every((goal) => board.size.isCoordinateInRange(goal));

    if (!goalsInBoard) {
      throw new LabyrinthError({
        message: 'One or more provided avatars are not in the board.',
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }

    if (!additionalGoalsInBoard) {
      throw new LabyrinthError({
        message: 'One or more provided additional goals are not in the board.',
        code: ErrorCode.BOARD_INVALID_COORDINATE,
      });
    }
  }
}
