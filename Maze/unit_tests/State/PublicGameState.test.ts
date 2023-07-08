import { Map as ImmutableMap } from 'immutable';
import { HorizontalDirection, VerticalDirection } from '../../Common/Direction';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../../Common/State/GameState';
import {
  board1,
  board1_spare_tile,
  board2,
  board2_shiftUp_connections0x0,
  board2_spare_tile,
} from '../../test_utility/BoardUtils';
import { StateUtils } from '../../test_utility/StateUtils';
import { SlideActionWithRotation } from '../../Common/Board/SlideAction';
import { deserializeBoard } from '../../Serialize/Board';
import { deserializeTile } from '../../Serialize/GameState';
import { PublicPlayerState } from '../../Common/PublicPlayerState';
import { assertBoardsEqual } from '../Board/Board.test';
import { Coordinate } from '../../Common/Board/Coordinate';
import { Color } from '../../Utility/Color';

describe('Testing BasicstateInfo.board', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    playersInfo = ImmutableMap();
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('GameState returns board1', () => {
    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    const publicState = gameState.getPublicGameState();
    assertBoardsEqual(publicState.getBoard(), deserializeBoard(board1));
  });

  test('GameState returns board2', () => {
    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board2),
      deserializeTile(board2_spare_tile),
      playersInfo
    );
    const publicState = gameState.getPublicGameState();
    assertBoardsEqual(publicState.getBoard(), deserializeBoard(board2));
  });
});

describe('Testing BasicGameState.playerInfoMap', () => {
  test('GameState returns correct list of avatars', () => {
    const players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 5, column: 3 })),
    ];

    let playersInfo: ImmutableMap<Color, PrivatePlayerInfo> = ImmutableMap();

    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const publicState = gameState.getPublicGameState();

    const playerStates = publicState.getPlayerStates();
    for (let i = 0; i < players.length; i++) {
      expect(players[i].position).toBe(playerStates[i].position);
      expect(players[i].home).toBe(playerStates[i].home);
      expect(players[i].color).toBe(playerStates[i].color);
    }
  });
});

describe('Testing simulating moves', () => {
  let playerStates: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    playersInfo = ImmutableMap();
    playerStates = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    playerStates[0] = {
      ...playerStates[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    for (const player of playerStates) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  describe('Testing BasicStateInfo.getReachableCoordinates', () => {
    test('GameState returns correct list of reachable positions for board1', () => {
      const board = deserializeBoard(board1);
      const gameState: GameState = new BasicGameState(
        playerStates,
        board,
        deserializeTile(board1_spare_tile),
        playersInfo
      );
      const slideAction: SlideActionWithRotation = {
        index: 0,
        rotations: 0,
        direction: HorizontalDirection.LEFT,
      };

      const publicState = gameState.getPublicGameState();

      const reachable = publicState.activePlayerCanMoveTo(slideAction);
      expect(reachable.size).toBe(1);
      expect(reachable.has(new Coordinate({ row: 0, column: 6 })));
    });

    test('GameState returns correct list of reachable positions for board2', () => {
      const board = deserializeBoard(board2);
      const gameState: GameState = new BasicGameState(
        playerStates,
        board,
        deserializeTile(board2_spare_tile),
        playersInfo
      );

      const slideAction: SlideActionWithRotation = {
        rotations: 0,
        index: 0,
        direction: VerticalDirection.UP,
      };

      const publicState = gameState.getPublicGameState();

      const reachable = publicState.activePlayerCanMoveTo(slideAction);

      for (let row = 0; row < board.size.rows; row++) {
        for (let column = 0; column < board.size.columns; column++) {
          if (row === board.size.rows - 1 && column === 0) continue;
          expect(reachable.contains(new Coordinate({ row, column }))).toBe(
            board2_shiftUp_connections0x0[row][column]
          );
        }
      }
    });
  });
});
