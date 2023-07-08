import { Map as ImmutableMap } from 'immutable';
import { BasicPlayer, Player } from '../Players/Player';
import { BasicReferee, Referee } from '../Referee/Referee';
import { mockPlayers } from '../test_utility/MockPlayer';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { StateUtils } from '../test_utility/StateUtils';
import { bad_board, BoardUtils, testGameBoard1 } from '../test_utility/BoardUtils';
import { Action, ActionType, Move, Pass } from '../Common/Action';
import { MoveUtils } from '../test_utility/MoveUtils';
import { HorizontalDirection, VerticalDirection } from '../Common/Direction';
import { Random } from '../Utility/Random';
import { createStrategy, StrategyType } from '../Players/Strategy';
import { BadPlayer } from '../test_utility/BadPlayer';
import { PublicPlayerState } from '../Common/PublicPlayerState';
import { executeMethodOrTimeout } from '../Utility/Function';
import { TILE_UP_DOWN, TILE_RIGHT_DOWN } from './Tile/Tiles';
import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';
import { Color } from '../Utility/Color';

jest.setTimeout(10000);
describe('Test Referee Resume GameState', () => {
  beforeEach(() => {
    process.env['NO_GOALS_IMMOVABLE_CONSTRAINT'] = undefined;
  });

  test('Referee calls methods on players', async () => {
    process.env['NO_GOALS_IMMOVABLE_CONSTRAINT'] = 'true';
    const boardSize = new GridSize({ rows: 7, columns: 7 });
    const avatars = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 5, column: 5 })),
    ];
    const goal1 = new Coordinate({ row: 1, column: 1 });
    const goal2 = new Coordinate({ row: 1, column: 3 });
    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: goal1,
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: goal2,
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    const name1 = 'a';
    const name2 = 'b';

    const [players, log] = mockPlayers([
      new BasicPlayer(name1, createStrategy(StrategyType.EUCLID)),
      new BasicPlayer(name2, createStrategy(StrategyType.EUCLID)),
    ]);
    const referee = new BasicReferee(boardSize);
    const goalSequence = [
      new Coordinate({ row: 1, column: 2 }),
      new Coordinate({ row: 1, column: 4 })
    ];

    const getGameState = () =>
      new BasicGameState(
        avatars.map(p => ({ ...p })),
        BoardUtils.boardFromTileChars(testGameBoard1),
        TILE_RIGHT_DOWN,
        playersInfo,
        undefined,
        [...goalSequence]
      );
    const gameState1 = getGameState();
    const gameResult = await referee.runGame(players, gameState1);

    for (let i = 0; i < 2; i++) {
      expect(log[i].playerName).toBe([name1, name2][i]);
      expect(log[i].methodName).toBe('setup');
      expect(log[i].args[0]).not.toBeUndefined();
      expect((log[i].args[1] as Coordinate)).toEqual([goal1, goal2][i]);
      expect(log[i].result).toBe(undefined);
    }
    expect(log[2].playerName).toBe(name1);
    expect(log[2].methodName).toBe('takeTurn');
    expect(log[2].args[0]).not.toBeUndefined();

    let lastMove: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 1, column: 1 }),
    };
    expect(MoveUtils.sameAction(log[2].result as Action, lastMove)).toBe(true);

    const gameState2 = getGameState();
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[3].playerName).toBe(name1);
    expect(log[3].methodName).toBe('setup');
    expect(log[3].args[0]).toBeUndefined();
    expect(log[3].args[1]).toEqual(goalSequence[0]);
    expect(log[3].result).toBeUndefined();

    expect(log[4].methodName).toBe('takeTurn');
    expect(log[4].playerName).toBe(name2);
    expect(log[4].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 5, column: 3 }),
    };
    expect(MoveUtils.sameAction(log[4].result as Action, lastMove)).toBe(true);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[5].playerName).toBe(name1);
    expect(log[5].methodName).toBe('takeTurn');
    expect(log[5].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: goalSequence[0],
    };
    expect(MoveUtils.sameAction(log[5].result as Action, lastMove)).toBe(true);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[6].playerName).toBe(name1);
    expect(log[6].methodName).toBe('setup');
    expect(log[6].args[0]).toBeUndefined();
    expect(log[6].args[1]).toEqual(goalSequence[1]);
    expect(log[6].result).toBeUndefined();

    expect(log[7].playerName).toBe(name2);
    expect(log[7].methodName).toBe('takeTurn');
    expect(log[7].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 5, column: 2 }),
    };
    expect(log[7].result).toEqual(lastMove);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[8].playerName).toBe(name1);
    expect(log[8].methodName).toBe('takeTurn');
    expect(log[8].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: goalSequence[1],
    };
    expect(log[8].result).toEqual(lastMove);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[9].playerName).toBe(name1);
    expect(log[9].methodName).toBe('setup');
    expect(log[9].args[0]).toBeUndefined();
    expect(log[9].args[1]).toEqual(avatars[0].home);
    expect(log[9].result).toBeUndefined();

    expect(log[10].playerName).toBe(name2);
    expect(log[10].methodName).toBe('takeTurn');
    expect(log[10].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: VerticalDirection.UP,
        index: 2,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 4, column: 3 })
    };
    expect(log[10].result).toEqual(lastMove);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[11].playerName).toBe(name1);
    expect(log[11].methodName).toBe('takeTurn');
    expect(log[11].args[0]).not.toBeUndefined();

    lastMove = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.LEFT,
        index: 0,
        rotations: 0,
      },
      moveTo: avatars[0].home,
    };
    expect(log[11].result).toEqual(lastMove);
    gameState2.executeAction(lastMove);
    gameState2.setNextActivePlayer();

    expect(log[12].methodName).toBe('win');
    expect(log[12].playerName).toBe(name1);
    expect(log[12].args[0]).toBe(true);
    expect(log[12].result).toBe(undefined);

    expect(log[13].playerName).toBe(name2);
    expect(log[13].methodName).toBe('win');
    expect(log[13].args[0]).toBe(false);
    expect(log[13].result).toBe(undefined);

    expect(gameResult.winners.has(players[0])).toBe(true);
    expect(gameResult.winners.has(players[1])).toBe(false);

    expect(gameState1.getNumTreasuresCollected(avatars[0].color)).toEqual(3);
    expect(gameState1.getNumTreasuresCollected(avatars[1].color)).toEqual(0);

    expect(gameState1.hasPlayerReachedAllGoals(avatars[0].color)).toBeTruthy();
    expect(gameState1.hasPlayerReachedAllGoals(avatars[1].color)).toBeFalsy();

    expect(gameResult.removed.size).toBe(0);
  });
});

describe('Referee Tests', () => {
  test('Referee always plays game to completion', done => {
    (async () => {
      const random = new Random('test1');
      for (let i = 0; i < 5; i++) {
        const boardSize = new GridSize({ rows: random.range(3, 5), columns: random.range(3, 5) });
        const [players, logs] = mockPlayers([
          new BasicPlayer('Player1', createStrategy(StrategyType.EUCLID)),
          new BasicPlayer('Player2', createStrategy(StrategyType.EUCLID)),
        ]);
        const referee = new BasicReferee(boardSize);
        const gameResult = await referee.runGame(players, random.gameState(boardSize, players.length));

        expect(logs.length > 6).toBe(true);
        expect(gameResult).not.toBe(undefined);
      }
    })().then(done);
  });

  test('Referee plays game with single player', done => {
    (async () => {
      const random = new Random('test1');
      for (let i = 0; i < 5; i++) {
        const boardSize = new GridSize({ rows: random.range(3, 5), columns: random.range(3, 5) });
        const [players, logs] = await mockPlayers([
          new BasicPlayer('Player1', createStrategy(StrategyType.EUCLID)),
        ]);
        const referee = new BasicReferee(boardSize);
        const gameResult = await referee.runGame(players, random.gameState(boardSize, players.length));

        expect(logs.length > 3).toBe(true);
        expect(gameResult).not.toBe(undefined);
        expect(gameResult.removed.size).toBe(0);
        expect(gameResult.winners.size).toBe(1);
        expect(gameResult.winners.values().next().value).toBe(players[0]);
      }
    })().then(done);
  });
});

describe('referee kicks misbehaving player', () => {
  class MisbehavingPlayer extends BasicPlayer {
    async takeTurn(): Promise<Move> {
      return {
        type: ActionType.MOVE,
        slideAction: {
          index: 0,
          direction: HorizontalDirection.LEFT,
          rotations: 0,
        },
        moveTo: new Coordinate({ row: 10, column: 10 }),
      };
    }
  }

  class PassPlayer extends BasicPlayer {
    async takeTurn(): Promise<Pass> {
      return {
        type: ActionType.PASS,
      };
    }
  }

  test('tests kick all players', async () => {
    const boardSize = new GridSize({ rows: 7, columns: 7 });
    const avatars = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 5, column: 5 })),
    ];

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: new Coordinate({ row: 1, column: 3 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    const name1 = 'a';
    const name2 = 'b';

    const [players, log] = mockPlayers([
      new MisbehavingPlayer(name1, createStrategy(StrategyType.EUCLID)),
      new MisbehavingPlayer(name2, createStrategy(StrategyType.EUCLID)),
    ]);
    const referee = new BasicReferee(boardSize);

    const gameState: GameState = new BasicGameState(
      avatars,
      BoardUtils.boardFromTileChars(testGameBoard1),
      TILE_RIGHT_DOWN,
      playersInfo
    );
    const gameResult = await referee.runGame(players, gameState);

    expect(gameResult.winners.size).toEqual(0);
    expect(gameResult.removed.size).toEqual(2);
    expect(log.length).toBe(4);
  });

  test('tests invalid player', done => {
    (async () => {
      const boardSize = new GridSize({ rows: 7, columns: 7 });
      const avatars = [
        StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
        StateUtils.generateAvatar(new Coordinate({ row: 5, column: 5 })),
      ];

      let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
      playersInfo = playersInfo.set(avatars[0].color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
      playersInfo = playersInfo.set(avatars[1].color, {
        goto: new Coordinate({ row: 1, column: 3 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });

      const name1 = 'a';
      const name2 = 'b';

      const [players, log] = mockPlayers([
        new MisbehavingPlayer(name1, createStrategy(StrategyType.EUCLID)),
        new PassPlayer(name2, createStrategy(StrategyType.EUCLID)),
      ]);
      const referee = new BasicReferee(boardSize);

      const gameState: GameState = new BasicGameState(
        avatars,
        BoardUtils.boardFromTileChars(testGameBoard1),
        TILE_RIGHT_DOWN,
        playersInfo
      );
      const gameResult = await referee.runGame(players, gameState);

      expect(gameResult.winners.size).toEqual(1);
      expect(gameResult.removed.size).toEqual(1);
      expect(log.length).toBe(5);
    })().then(done);
  });

  test('game ends when all players pass', async () => {
    const boardSize = new GridSize({ rows: 7, columns: 7 });
    const avatars = [
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    avatars[0] = {
      ...avatars[0],
      position: new Coordinate({ row: 1, column: 1 }),
    };

    avatars[1] = {
      ...avatars[1],
      position: new Coordinate({ row: 1, column: 1 }),
    };

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    const name1 = 'a';
    const name2 = 'b';

    const [players, log] = mockPlayers([
      new PassPlayer(name1, createStrategy(StrategyType.EUCLID)),
      new PassPlayer(name2, createStrategy(StrategyType.EUCLID)),
    ]);
    const referee = new BasicReferee(boardSize);

    const gameState: GameState = new BasicGameState(
      avatars,
      BoardUtils.boardFromTileChars(testGameBoard1),
      TILE_RIGHT_DOWN,
      playersInfo
    );
    const gameResult = await referee.runGame(players, gameState);

    expect(gameResult.winners.size).toEqual(2);
    expect(gameResult.removed.size).toEqual(0);
    expect(log.length).toBe(6);
  });

  test('game correctly kicks players', async () => {
    const boardSize = new GridSize({ rows: 7, columns: 7 });
    const avatars = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    const name1 = 'a';
    const name2 = 'b';

    const [players] = mockPlayers([
      new BasicPlayer(name1, createStrategy(StrategyType.EUCLID)),
      new BadPlayer(new BasicPlayer(name2, createStrategy(StrategyType.EUCLID)), 'setUp'),
    ]);
    const referee = new BasicReferee(boardSize);

    const gameState: GameState = new BasicGameState(
      avatars,
      BoardUtils.boardFromTileChars(bad_board),
      TILE_UP_DOWN,
      playersInfo
    );
    const gameResult = await referee.runGame(players, gameState);

    expect(gameResult.winners.size).toEqual(1);
    expect(gameResult.removed.size).toEqual(1);
  });

  describe('game kicks players who take too long to respond', () => {
    let boardSize: GridSize;
    let avatars: PublicPlayerState[];
    let players: Player[];
    let referee: Referee;
    let gameState: GameState;
    const timeout = 200;

    beforeEach(async () => {
      boardSize = new GridSize({ rows: 7, columns: 7 });
      avatars = [StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 }))];

      let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
      playersInfo = playersInfo.set(avatars[0].color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });

      players = mockPlayers([new BasicPlayer('a', createStrategy(StrategyType.EUCLID))])[0];

      referee = new BasicReferee(boardSize, timeout);
      gameState = new BasicGameState(
        avatars,
        BoardUtils.boardFromTileChars(bad_board),
        TILE_UP_DOWN,
        playersInfo
      );
    });

    test("w/o the timeout won't kick the player", async () => {
      // When running with the same thing (but without the timeout), should pass
      const gameResult = await referee.runGame(players, gameState);
      expect(gameResult.removed.size).toEqual(0);
    });

    test('executeMethod', async () => {
      const fn = () => new Promise(r => setTimeout(r, timeout + 50));
      await expect(executeMethodOrTimeout(fn, timeout)).rejects.toThrow();
    });

    test('setup', async () => {
      const fn = jest.fn(async () => {
        await new Promise(r => setTimeout(r, timeout + 200));
      });
      players[0].setup = fn;

      const gameResult = await referee.runGame(players, gameState);
      expect(gameResult.removed.size).toEqual(1);
    });

    test('takeTurn', async () => {
      const takeTurn = jest.fn(async _state => {
        await new Promise(r => setTimeout(r, timeout + 200));
        return { type: ActionType.PASS } as Action;
      });
      players[0].takeTurn = takeTurn;

      const gameResult = await referee.runGame(players, gameState);
      expect(gameResult.removed.size).toEqual(1);
    });

    test('won', async () => {
      const win = jest.fn(async _won => {
        await new Promise(r => setTimeout(r, timeout + 200));
      });
      players[0].win = win;

      const gameResult = await referee.runGame(players, gameState);
      expect(gameResult.removed.size).toEqual(1);
    });
  });
});

describe('scoring a game', () => {
  test.todo('single player collected most goals');
  test.todo('multiple players collected same number of goals');
  test.todo('multiple players collected same number of goals with same distance to next goal');
  test.todo('no players left in the game state');
  test.todo('no players have collected any treasures');
});
