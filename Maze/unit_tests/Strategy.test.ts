import { Map as ImmutableMap } from 'immutable';
import { Move, ActionType } from '../Common/Action';
import { GameState, BasicGameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { EuclidStrategy, RiemannStrategy, Strategy } from '../Players/Strategy';
import {
  BoardUtils,
  board_riemann_1,
  board_riemann_2,
  board_riemann_3,
  board_riemann_4,
  board_slide,
  board_trap,
  can_reach_goal_1,
  euclid_board1,
  can_reach_goal_2,
} from '../test_utility/BoardUtils';
import { StateUtils } from '../test_utility/StateUtils';
import { HorizontalDirection, VerticalDirection } from '../Common/Direction';
import { PublicPlayerState } from '../Common/PublicPlayerState';
import { TILE_UP_DOWN, TILE_LEFT_DOWN, TILE_UP_RIGHT, TILE_LEFT_RIGHT } from './Tile/Tiles';
import { Coordinate } from '../Common/Board/Coordinate';
import { Color } from '../Utility/Color';

describe('Test Riemann strategy', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    playersInfo = ImmutableMap();
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 1 })),
    ];

    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('can reach goal after slide', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });
    players[0] = {
      ...players[0],
      position: playerPosition,
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const board = BoardUtils.boardFromTileChars(board_slide);
    const gameState: GameState = new BasicGameState(players, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(VerticalDirection.DOWN);
    expect((move as Move).slideAction.index).toEqual(2);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(goalPosition)).toEqual(true);
  });

  test('player is trapped', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });
    players[0] = {
      ...players[0],
      position: playerPosition,
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const board = BoardUtils.boardFromTileChars(board_trap);
    const gameState: GameState = new BasicGameState(players, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.PASS);
  });

  test('player goes to top-left corner', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });
    players[0] = {
      ...players[0],
      position: playerPosition,
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const board = BoardUtils.boardFromTileChars(board_riemann_1);
    const gameState: GameState = new BasicGameState(players, board, TILE_UP_DOWN, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(VerticalDirection.UP);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(Coordinate.ORIGIN)).toEqual(true);
  });

  test('player goes to next column', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });

    const board = BoardUtils.boardFromTileChars(board_riemann_2);
    players[0] = {
      ...players[0],
      position: playerPosition,
    };
    playersInfo.get(players[0].color)!.goto = goalPosition;

    const gameState: GameState = new BasicGameState(players, board, TILE_UP_DOWN, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(HorizontalDirection.LEFT);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(new Coordinate({ row: 0, column: 1 }))).toEqual(true);
  });

  test('player can reach top-most with rotations', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });

    players[0] = {
      ...players[0],
      position: playerPosition,
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const board = BoardUtils.boardFromTileChars(board_riemann_3);
    const gameState: GameState = new BasicGameState(players, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(VerticalDirection.DOWN);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(2);
    expect((move as Move).moveTo.equals(Coordinate.ORIGIN)).toEqual(true);
  });

  test('player can reach second row', () => {
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    const playerPosition = new Coordinate({ row: 1, column: 1 });

    const board = BoardUtils.boardFromTileChars(board_riemann_4);
    players[0] = {
      ...players[0],
      position: playerPosition,
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const gameState: GameState = new BasicGameState(players, board, TILE_UP_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const riemann: Strategy = new RiemannStrategy();
    const move = riemann.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(VerticalDirection.DOWN);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(new Coordinate({ row: 1, column: 0 }))).toEqual(true);
  });
});

describe('Test Euclid strategy', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    playersInfo = ImmutableMap();
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 1 })),
    ];

    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('reaches closest position to goal', () => {
    const board = BoardUtils.boardFromTileChars(euclid_board1);
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 1, column: 2 }),
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const gameState: GameState = new BasicGameState(players, board, TILE_LEFT_DOWN, playersInfo);
    const publicState = gameState.getPublicGameState();

    const euclid: Strategy = new EuclidStrategy();
    const move = euclid.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(VerticalDirection.DOWN);
    expect((move as Move).slideAction.index).toEqual(2);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(new Coordinate({ row: 2, column: 1 }))).toEqual(true);
  });

  test('can reach goal after slide', () => {
    const board = BoardUtils.boardFromTileChars(can_reach_goal_1);
    const goalPosition = new Coordinate({ row: 3, column: 1 });
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 5 }),
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;

    const gameState: GameState = new BasicGameState(players, board, TILE_LEFT_DOWN, playersInfo);
    const publicState = gameState.getPublicGameState();

    const euclid: Strategy = new EuclidStrategy();
    const move = euclid.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(HorizontalDirection.RIGHT);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(new Coordinate({ row: 3, column: 1 }))).toEqual(true);
  });

  test('can reach goal after wrap around', () => {
    const board = BoardUtils.boardFromTileChars(can_reach_goal_2);
    const goalPosition = new Coordinate({ row: 1, column: 1 });
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo.get(players[0].color)!.goto = goalPosition;
    const gameState: GameState = new BasicGameState(players, board, TILE_LEFT_RIGHT, playersInfo);
    const publicState = gameState.getPublicGameState();

    const euclid: Strategy = new EuclidStrategy();
    const move = euclid.computeAction(publicState, goalPosition, players[0].color);

    expect(move.type).toEqual(ActionType.MOVE);
    expect((move as Move).slideAction.direction).toEqual(HorizontalDirection.LEFT);
    expect((move as Move).slideAction.index).toEqual(0);
    expect((move as Move).slideAction.rotations).toEqual(0);
    expect((move as Move).moveTo.equals(new Coordinate({ row: 1, column: 1 }))).toEqual(true);
  });
});
