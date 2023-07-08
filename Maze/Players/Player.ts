import {PublicGameState} from '../Common/State/PublicGameState';
import {Action} from '../Common/Action';
import {BasicBoard, Board} from '../Common/Board/Board';
import {Strategy} from './Strategy';
import {ErrorCode, LabyrinthError} from '../Common/LabyrinthError';
import {Random} from '../Utility/Random';
import {Tile} from '../Common/Tile/Tile';
import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';

/**
 * A {@link Player} is a player participating in a game of Maze.
 */
export interface Player {

  /**
   * The player's name.
   */
  name: () => string;

  /**
   * Requests a proposed {@link Board} from the player, which must (at minimum)
   * be of the dimensions given.
   */
  proposeBoard0: (size: GridSize) => Promise<Board>;

  /**
   * Provides the player with a goal {@link Coordinate} and the {@link PublicGameState}.
   * If no state is provided, the player will simply update their goal.
   */
  setup: (goal: Coordinate, stateInfo?: PublicGameState) => Promise<void>;

  /**
   * Given a {@link PublicGameState}, expects a legal {@link Action} that this
   * player desires, based on their internal strategy.
   */
  takeTurn: (stateInfo: PublicGameState) => Promise<Action>;

  /**
   * Inform the player whether it has won.
   */
  win: (didWin: boolean) => Promise<void>;
}

/**
 * A basic implementation of a {@link Player}, which relies on a given
 * {@link Strategy} to make decisions about its actions in the game.
 */
export class BasicPlayer implements Player {
  static readonly nameRegex = new RegExp(/^[a-zA-Z0-9]{1,20}$/);

  private readonly playerName: string;
  private readonly strategy: Strategy;
  private goal: Coordinate | undefined;
  private didWin?: boolean;

  public constructor(playerName: string, strategy: Strategy) {
    if (!BasicPlayer.isValidName(playerName)) {
      throw new Error(`Invalid player name given: ${playerName}`)
    }
    this.playerName = playerName;
    this.strategy = strategy;
  }

  public static isValidName(name: string): boolean {
    return BasicPlayer.nameRegex.test(name);
  }

  public name(): string {
    return this.playerName;
  }

  public async proposeBoard0(_size: GridSize): Promise<Board> {
    throw 'proposeBoard0 is not implemented';
  }

  public async setup(goal: Coordinate, _stateInfo?: PublicGameState) {
    this.goal = goal;
  }

  public async takeTurn(stateInfo: PublicGameState): Promise<Action> {
    if (this.goal === undefined) {
      throw new LabyrinthError({
        message: 'Cannot take turn before this player is setup.',
        code: ErrorCode.PLAYER_NOT_SETUP
      });
    }

    return this.strategy.computeAction(stateInfo, this.goal, stateInfo.getPlayerStates()[0].color);
  }

  public async win(didWin: boolean): Promise<void> {
    this.didWin = didWin;
  }
}
