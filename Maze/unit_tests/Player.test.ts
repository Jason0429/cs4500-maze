import {Map as ImmutableMap} from 'immutable';
import {ActionType, Move} from '../Common/Action';
import {SlideActionWithRotation} from '../Common/Board/SlideAction';
import {Coordinate} from '../Common/Board/Coordinate';
import {GridSize} from '../Common/Board/GridSize';
import {HorizontalDirection, VerticalDirection} from '../Common/Direction';
import {BasicGameState, GameState, PrivatePlayerInfo} from '../Common/State/GameState';
import {BasicPlayer} from '../Players/Player';
import {createStrategy, StrategyType} from '../Players/Strategy';
import {BoardUtils, board_trap, player_board} from '../test_utility/BoardUtils';
import {StateUtils} from '../test_utility/StateUtils';
import {Color} from '../Utility/Color';
import {Random} from '../Utility/Random';
import {TILE_UP_DOWN, TILE_UP_RIGHT} from './Tile/Tiles';

describe('Player tests', () => {
  const random = new Random('test1');

  test('Testing BasicPlayer.name', async () => {
    const player = new BasicPlayer('test', createStrategy(StrategyType.EUCLID));
    expect(await player.name()).toBe('test');
  });

  test('Testing BasicPlayer.proposeBoard0', async () => {
    for (let i = 0; i < 100; i++) {
      const boardSize = new GridSize({
        rows: random.range(2, 7),
        columns: random.range(2, 7),
      });
      expect((new Random('test1').board(boardSize)).size.equals(boardSize)).toBe(true);
    }
  });

  test('Testing player goes to goal and then home', async () => {
    const playerHome = new Coordinate({row: 1, column: 1});
    const playerGoal = new Coordinate({row: 5, column: 5});

    const avatars = [
      StateUtils.generateAvatar(playerHome),
      StateUtils.generateAvatar(new Coordinate({row: 1, column: 3})),
    ];

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: playerGoal,
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false,
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: new Coordinate({row: 1, column: 1}),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false,
    });
    const board = BoardUtils.boardFromTileChars(player_board);
    const gameState: GameState = new BasicGameState(avatars, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const player = new BasicPlayer('name1', createStrategy(StrategyType.EUCLID));
    expect(() => {
      player.setup(playerGoal, publicState);
    }).not.toThrow();

    const move1 = (await player.takeTurn(publicState)) as Move;
    expect(move1.type).toBe(ActionType.MOVE);
    expect(move1.slideAction).toEqual({
      direction: VerticalDirection.DOWN,
      index: 6,
      rotations: 0,
    } as SlideActionWithRotation);
    expect(move1.moveTo.equals(playerGoal)).toBe(true);
    gameState.executeAction(move1);
    gameState.setNextActivePlayer();
    const publicState2 = gameState.getPublicGameState();

    expect(() => {
      player.setup(playerHome);
    }).not.toThrow();

    const move2 = (await player.takeTurn(publicState2)) as Move;
    expect(move2.type).toBe(ActionType.MOVE);
    expect(move2.slideAction).toEqual({
      direction: HorizontalDirection.LEFT,
      index: 0,
      rotations: 0,
    } as SlideActionWithRotation);
    expect(move2.moveTo.equals(playerHome)).toBe(true);
    expect(() => {
      gameState.executeAction(move2);
    }).not.toThrow();

    expect(() => {
      player.win(true);
    }).not.toThrow();
  });

  test('player is trapped', async () => {
    const goalPosition = new Coordinate({row: 3, column: 1});
    const playerPosition = new Coordinate({row: 1, column: 1});

    const board = BoardUtils.boardFromTileChars(board_trap);
    const avatars = [
      StateUtils.generateAvatar(playerPosition),
      StateUtils.generateAvatar(new Coordinate({row: 3, column: 1})),
    ];

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatars[0].color, {
      goto: goalPosition,
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false,
    });
    playersInfo = playersInfo.set(avatars[1].color, {
      goto: new Coordinate({row: 1, column: 1}),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false,
    });

    const gameState: GameState = new BasicGameState(avatars, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const player = new BasicPlayer('a', createStrategy(StrategyType.EUCLID));
    player.setup(playersInfo.get(avatars[0].color)!.goto, publicState);
    const action = await player.takeTurn(publicState);

    expect(action.type).toEqual(ActionType.PASS);
  });

  test('BasicPlayer always returns a valid move if it has a goal', async () => {
    for (let i = 0; i < 100; i++) {
      const playerName = 'player1';
      const players = [
        StateUtils.generateAvatar(new Coordinate({row: 3, column: 1})),
        StateUtils.generateAvatar(new Coordinate({row: 1, column: 1})),
      ];

      let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
      playersInfo = playersInfo.set(players[0].color, {
        goto: new Coordinate({row: 1, column: 1}),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false,
      });
      playersInfo = playersInfo.set(players[1].color, {
        goto: new Coordinate({row: 1, column: 1}),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false,
      });

      const player = new BasicPlayer(playerName, createStrategy(StrategyType.EUCLID));
      const gameState: GameState = new BasicGameState(
        players,
        new Random('test1').board(
          new GridSize({
            rows: new Random('test1').range(2, 10),
            columns: new Random('test1').range(2, 10),
          })
        ),
        TILE_UP_DOWN,
        playersInfo
      );
      const publicState = gameState.getPublicGameState();

      player.setup(playersInfo.get(players[0].color)!.goto, publicState);
      const action = await player.takeTurn(publicState);
      if (action.type === ActionType.MOVE) {
        expect(() => {
          gameState.executeAction(action);
        }).not.toThrow();
      }
    }
  });

  test('BasicPlayer throws an error if it does not have a goal yet', async () => {
    const players = [StateUtils.generateAvatar(new Coordinate({row: 3, column: 1}))];

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(players[0].color, {
      goto: new Coordinate({row: 1, column: 1}),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false,
    });

    const player = new BasicPlayer('playerName', createStrategy(StrategyType.EUCLID));
    const gameState = new BasicGameState(
      players,
      new Random('test1').board(
        new GridSize({
          rows: new Random('test1').range(2, 10),
          columns: new Random('test1').range(2, 10),
        })
      ),
      TILE_UP_DOWN,
      playersInfo
    );
    const publicState = gameState.getPublicGameState();

    expect(() => player.takeTurn(publicState)).rejects.toThrow(/Cannot take turn/);
  });
});
