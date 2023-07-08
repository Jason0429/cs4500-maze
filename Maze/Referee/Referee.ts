import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import { PublicPlayerState } from '../Common/PublicPlayerState';
import { ErrorCode, LabyrinthError } from '../Common/LabyrinthError';
import { Action, ActionType } from '../Common/Action';
import { GameState } from '../Common/State/GameState';
import { Random } from '../Utility/Random';
import { GameResult } from './GameResult';
import { Player } from '../Players/Player';
import { executeMethodOrTimeout } from '../Utility/Function';
import { Observable, Observer } from './Observer';
import { Color } from '../Utility/Color';
import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';
import { Rules } from '../Common/Rules';

const DEFAULT_PLAYER_TIMEOUT = 4000;
const DEFAULT_TOTAL_ROUNDS = 1000;

/**
 * Defines the methods available to control a referee for a game of Labyrinth.
 * The referee is responsible for running a game to completion, managing
 * player moves and game state.
 */
export interface Referee {
  /**
   * Request the referee to run the game to completion and return the outcome of the game
   * as a {@link GameResult}.
   *
   * If a GameState is provided, the referee will resume that game rather than
   * create a new state.
   */
  runGame(
    players: Player[],
    gameState?: GameState,
    goalSequence?: Coordinate[]
  ): Promise<GameResult>;
}

/**
 * An implementation of {@link Referee} that plays a Maze game on a specified sized board.
 */
export class BasicReferee implements Referee, Observable {
  private playerMap: ImmutableMap<Color, Player>;
  public readonly playerTimeout: number;
  public readonly totalRounds: number;
  private kickedPlayers: ImmutableSet<Player>;
  private observers: ImmutableSet<Observer>;
  private readonly boardSize: GridSize;

  /**
   * Checks if this {@link Referee} is currently running a game.
   */
  private isGameInProgress = false;

  constructor(boardSize: GridSize, timeout?: number, totalRounds?: number) {
    this.ensureBoardSizeWithinBounds(boardSize);
    this.boardSize = boardSize;
    this.playerMap = ImmutableMap<Color, Player>();
    this.kickedPlayers = ImmutableSet<Player>();
    this.observers = ImmutableSet<Observer>();
    this.playerTimeout = timeout ?? DEFAULT_PLAYER_TIMEOUT;
    this.totalRounds = totalRounds ?? DEFAULT_TOTAL_ROUNDS;
  }

  public async runGame(players: Player[], gameState?: GameState): Promise<GameResult> {
    const curGameState = gameState ?? this.createGameState(players.length);

    const playerColors = this.getColorsForPlayers(players, curGameState);
    this.playerMap = this.generatePlayerMap(playerColors, players);
    this.ensureBoardSizeCorrect(curGameState);
    this.ensurePlayerMapMatches(curGameState);

    await this.setupPlayers(curGameState);
    this.notifyObserversOfState(curGameState, 0);

    this.isGameInProgress = true;
    await this.playRounds(curGameState);
    this.isGameInProgress = false;
    return await this.scoreGame(curGameState);
  }

  /**
   * Given the number of players in a game, creates a random {@link GameState}
   * populated with that number of {@link PublicPlayerState}.
   */
  private createGameState(numPlayers: number): GameState {
    return new Random().gameState(this.boardSize, numPlayers);
  }

  public attachObserver(observer: Observer): void {
    this.observers = this.observers.add(observer);
  }

  public removeObserver(observer: Observer): void {
    this.observers = this.observers.remove(observer);
  }

  /**
   * Throws if the board in the given {@link GameState}
   * does not match the specified dimensions.
   */
  private ensureBoardSizeCorrect(gameState: GameState) {
    const boardSize = gameState.getBoard().size;
    if (boardSize.rows < this.boardSize.rows || boardSize.columns < this.boardSize.columns) {
      throw new LabyrinthError({
        message: 'Referee specified board size and GameState board size does not match.',
        code: ErrorCode.BOARD_SIZE_MISMATCH,
      });
    }
  }

  /**
   * Throws if the board size given is not at least a 2x2.
   */
  private ensureBoardSizeWithinBounds(boardSize: GridSize) {
    if (boardSize.rows < 2 || boardSize.columns < 2) {
      throw new LabyrinthError({
        message: 'Board size should be at least 2 rows and columns.',
        code: ErrorCode.BOARD_SIZE_INVALID,
      });
    }
  }

  /**
   * The main loop of the game, in which rounds are sequentially
   * processed.
   */
  private async playRounds(gameState: GameState): Promise<void> {
    for (let round = 0; round < DEFAULT_TOTAL_ROUNDS; round++) {
      this.ensurePlayerMapMatches(gameState);
      await this.playRound(gameState);

      if (this.playerMap.size === 0) {
        this.isGameInProgress = false;
      }

      if (!this.isGameInProgress) {
        break;
      }
    }
  }

  /**
   * Plays a single round of the game, requesting a turn from each player
   * and processing it appropriately.
   */
  private async playRound(gameState: GameState): Promise<void> {
    let passed = 0;

    const numPlayers = this.playerMap.size;
    for (let turn = 0; turn < numPlayers; turn++) {
      const activePlayerColor = gameState.getActivePlayerState().color;
      const action = await this.activePlayerPlayTurn(gameState);

      this.notifyObserversOfState(gameState, passed);

      passed = this.updateNumberOfPlayerPassed(action, passed);

      if (this.playerMap.size === passed) {
        this.isGameInProgress = false;
      }

      if (!this.isGameInProgress) return;

      // If the player has been kicked, there is no need to set the next active player
      if (activePlayerColor === gameState.getActivePlayerState().color) {
        gameState.setNextActivePlayer();
      }
    }
  }

  /**
   * Given an optional {@link Action} and the number of passes so far, returns an updated number of passes.
   */
  private updateNumberOfPlayerPassed(action: Option<Action>, passed: number): number {
    if (action.type === OptionType.VALUE && action.value.type === ActionType.PASS) {
      return passed + 1;
    }
    return passed;
  }

  /**
   * Plays a single turn, asking the active player for an {@link Action} and executing it.
   *
   * If the player misbehaves, it is removed and its {@link Action} is not applied.
   */
  private async activePlayerPlayTurn(gameState: GameState): Promise<Option<Action>> {
    const activePlayerColor = gameState.getActivePlayerState().color;
    const proposedAction = await this.getActivePlayerProposedAction(gameState);

    if (proposedAction.type === OptionType.NONE) {
      return proposedAction;
    }

    const playerAction = proposedAction.value;

    if (Rules.isActionLegal(gameState, playerAction)) {
      gameState.executeAction(playerAction);

      if (playerAction.type === ActionType.MOVE && gameState.isActivePlayerOnGoal()) {
        await this.assignActivePlayerNextGoal(gameState);
      }

      return proposedAction;
    } else {
      this.kickPlayer(activePlayerColor, gameState);
      return { type: OptionType.NONE };
    }
  }

  /**
   * Given a {@link GameState}, requests an {@link Action} from the currently active player.
   * If the {@link Player} misbehaves in some way, it will be kicked from the game.
   */
  private async getActivePlayerProposedAction(gameState: GameState): Promise<Option<Action>> {
    const activePlayer = this.getActivePlayer(gameState);
    const activePlayerColor = gameState.getActivePlayerState().color;
    return this.callPlayerMethod<Action>(
      () => {
        return activePlayer.takeTurn(gameState.getPublicGameState());
      },
      activePlayerColor,
      gameState
    );
  }

  /**
   * Given a {@link GameState}, assigns the currently-active player a new "goal" (can be home),
   * and notifies the {@link Player} about it. If the player's reached goal was its home, ends the game.
   */
  private async assignActivePlayerNextGoal(gameState: GameState): Promise<void> {
    const { color: activeColor, home: activeHome } = gameState.getActivePlayerState();

    const activePlayer = this.getActivePlayer(gameState);

    if (gameState.hasPlayerReachedAllGoals(activeColor)) {
      gameState.setPlayerHasReturnedHome(activeColor, true);
      this.isGameInProgress = false;
    } else {
      const goto = gameState.goalSequence.shift() ?? activeHome;
      gameState.setPlayerGoal(activeColor, goto);
      gameState.incrementTreasuresCollected(activeColor);

      // If we've just assigned the last goal in the extra sequence,
      // and it coincides with the home, don't allow the player to collect it.
      if (gameState.goalSequence.length === 0 && goto.equals(activeHome)) {
        gameState.setPlayerHasReachedAllGoals(activeColor, true);
      }

      await this.callPlayerMethod(() => activePlayer.setup(goto), activeColor, gameState);
    }
  }

  /**
   * Generate a mapping of player IDs to players.
   */
  private generatePlayerMap(playerIds: Color[], players: Player[]): ImmutableMap<Color, Player> {
    return ImmutableMap<Color, Player>(players.map((player, i) => [playerIds![i], player]));
  }

  /**
   * Calculates the winners of the given {@link GameState} and notifies the
   * corresponding {@link Player}s if they won/list.
   */
  private async scoreGame(gameState: GameState): Promise<GameResult> {
    const winners = this.calculateWinners(gameState);

    const gameResults: GameResult = await this.notifyPlayersOfResults(winners);
    this.notifyObserversOfResults(gameResults);

    return gameResults;
  }

  /**
   * Calculates the winners of the provided game state using the following metric:
   * - the players who have collected the same highest number of treasures and who share
   *   the minimal euclidean distance to their next goal.
   */
  private calculateWinners(gameState: GameState): ImmutableSet<Player> {
    this.ensurePlayerMapMatches(gameState);
    if (this.playerMap.size === 0) {
      return ImmutableSet();
    }

    const candidates = this.getPlayersWithMostTreasuresCollected(gameState);

    if (this.didGameTerminatingPlayerWin(candidates, gameState)) {
      return ImmutableSet([this.getActivePlayer(gameState)]);
    }

    return this.getPlayersClosestToCoordinate(candidates, gameState, playerState =>
      gameState.getPlayerGoal(playerState.color)
    );
  }

  /**
   * Given a {@link GameState}, returns the {@link PublicPlayerState}s of the players which
   * have collected the maximum number of treasures.
   */
  private getPlayersWithMostTreasuresCollected(gameState: GameState): Array<PublicPlayerState> {
    const playerStates = gameState.getPlayerStates();
    const numGoalsCollected = playerStates.map(p => gameState.getNumTreasuresCollected(p.color));

    const maxNumGoalsCollected = Math.max(...numGoalsCollected);

    return playerStates.filter((p, idx) => numGoalsCollected[idx] === maxNumGoalsCollected);
  }

  /**
   * Given an array of candidate {@link PublicPlayerState}s and a {@link GameState},
   * determines if the active player (ie. the last player take a turn before the game ended)
   * was the game-terminating player (ie. ended the game with a {@link Move})
   */
  private didGameTerminatingPlayerWin(
    candidates: Array<PublicPlayerState>,
    gameState: GameState
  ): boolean {
    const activePlayerState = gameState.getActivePlayerState();
    const isCandidate = candidates.includes(activePlayerState);
    const reachedHome = gameState.hasReturnedHome(activePlayerState.color);

    return isCandidate && reachedHome;
  }

  /**
   * Given a list of {@link PublicPlayerState}s, returns the players closest to
   * a target {@link Coordinate}, which is determined in a player-by-player basis
   * via the given {@link getTarget} function.
   */
  private getPlayersClosestToCoordinate(
    playerStates: PublicPlayerState[],
    gameState: GameState,
    getTarget: (playerState: PublicPlayerState) => Coordinate
  ): ImmutableSet<Player> {
    this.ensurePlayerMapMatches(gameState);

    const distancesFromTarget = playerStates.map(ps =>
      Coordinate.squaredEuclideanDistance(ps.position, getTarget(ps))
    );

    const minDistanceToTarget = Math.min(...distancesFromTarget);

    const playerStatesClosestToTarget = playerStates.filter((_, i) => {
      return distancesFromTarget[i] === minDistanceToTarget;
    });

    const playersClosestToTarget = playerStatesClosestToTarget.map(p => {
      return this.playerMap.get(p.color)!;
    });

    return ImmutableSet<Player>(playersClosestToTarget);
  }

  /**
   * Notify all registered players of the current game state.
   */
  private async setupPlayers(gameState: GameState): Promise<void> {
    this.ensurePlayerMapMatches(gameState);
    const publicState = gameState.getPublicGameState();

    for (const [color, player] of this.playerMap.entries()) {
      await this.callPlayerMethod<void>(
        () => {
          return player.setup(gameState.getPlayerGoal(color), publicState);
        },
        color,
        gameState
      );
    }
  }

  /**
   * Extract the provided player IDs or generate new ones.
   */
  private getColorsForPlayers(players: Player[], gameState: GameState): Color[] {
    const colors = gameState.getPlayerStates().map(avatar => avatar.color);
    if (colors.length !== players.length) {
      throw new LabyrinthError({
        message: 'Provided colors do not match provided players.',
        code: ErrorCode.PLAYER_COLORS_DO_NOT_MATCH,
      });
    }
    return colors;
  }

  /**
   * Ensure that the referee's list of players matches the provided
   * game state's list of avatars.
   */
  private ensurePlayerMapMatches(gameState: GameState) {
    const avatars = gameState.getPlayerStates();
    const numPlayersMatch = this.playerMap.size === avatars.length;
    const playerColorsMatch = avatars.every(avatar => this.playerMap.has(avatar.color));

    if (!numPlayersMatch || !playerColorsMatch) {
      throw new LabyrinthError({
        message: 'Mismatch detected between gameState avatars and player map!',
        code: ErrorCode.AVATAR_PLAYER_MAP_MISMATCH,
      });
    }
  }

  /**
   * Notifies all players of whether they have won or not.
   *
   * Note: after this method, the PlayerMap is not guaranteed to be
   * consistent with game state.
   */
  private async notifyPlayersOfResults(winners: ImmutableSet<Player>): Promise<GameResult> {
    for (const [color, player] of this.playerMap.entrySeq()) {
      await this.callPlayerMethod<void>(() => player.win(winners.has(player)), color);
      if (this.kickedPlayers.has(player)) {
        winners = winners.remove(player);
      }
    }

    return {
      winners,
      removed: this.kickedPlayers,
    };
  }

  /**
   * Attempt to perform a method, kicking the player with the given {@link Color} if
   * the method misbehaves (errors or times out).
   *
   * Optionally accepts a {@link GameState}; if the method misbehaves, the player will be
   * kicked from this state as well.
   *
   * Returns an Option<T> that has a value if the method was successful.
   */
  private async callPlayerMethod<T>(
    methodRef: () => Promise<T>,
    playerColor: Color,
    gameState?: GameState
  ): Promise<Option<T>> {
    try {
      const value = await executeMethodOrTimeout(methodRef, this.playerTimeout);
      return { type: OptionType.VALUE, value: value };
    } catch (e) {
      this.kickPlayer(playerColor, gameState);
      return { type: OptionType.NONE };
    }
  }

  /**
   * Returns the active {@link Player} in the given {@link GameState}.
   */
  private getActivePlayer(gameState: GameState): Player {
    const activePlayerColor = gameState.getActivePlayerState().color;
    const activePlayer = this.playerMap.get(activePlayerColor);

    if (activePlayer === undefined) {
      throw new LabyrinthError({
        message: 'Active player not found!',
        code: ErrorCode.PLAYER_AVATAR_NOT_FOUND,
      });
    }

    return activePlayer;
  }

  /**
   * Kick a player for misbehaving and record their ID to be returned later.
   */
  private kickPlayer(playerColor: Color, gameState?: GameState): void {
    if (!this.playerMap.has(playerColor)) {
      throw new LabyrinthError({
        message: `No player found with color '${playerColor.color}'`,
        code: ErrorCode.PLAYER_INFO_NOT_FOUND,
      });
    }
    this.kickedPlayers = this.kickedPlayers.add(this.playerMap.get(playerColor)!);
    this.playerMap = this.playerMap.remove(playerColor);
    gameState?.kickPlayer(playerColor);
  }

  /**
   * Broadcast a state update to all attached observers.
   */
  private notifyObserversOfState(gameState: GameState, passed: number): void {
    for (const observer of this.observers) {
      observer.stateUpdate(gameState, passed);
    }
  }

  /**
   * Broadcast a game result to all attached observers.
   */
  private notifyObserversOfResults(results: GameResult): void {
    for (const observer of this.observers) {
      observer.gameOver(results);
    }
  }
}

/**
 * Represents the types of an option; either an option is none or a value.
 */
enum OptionType {
  NONE = 'NONE',
  VALUE = 'VALUE',
}

/**
 * An Option is either a Value of type T or None.
 */
type Option<T> = None | Value<T>;

/**
 * Represents None to be used in Option
 */
interface None {
  type: OptionType.NONE;
}

/**
 * Value is a wrapper object for the value T
 */
interface Value<T> {
  type: OptionType.VALUE;
  value: T;
}
