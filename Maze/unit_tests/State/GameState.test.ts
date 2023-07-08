import { Map as ImmutableMap } from 'immutable';
import { Board } from '../../Common/Board/Board';
import { Direction, HorizontalDirection, VerticalDirection } from '../../Common/Direction';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../../Common/State/GameState';
import { ErrorCode, LabyrinthError } from '../../Common/LabyrinthError';
import {
  board1,
  board1_move1,
  board1_spare_tile,
  board1_wrap,
  board1_wrap_move,
  board2,
  board2_shiftUp_connections0x0,
  board2_spare_tile,
  BoardUtils,
} from '../../test_utility/BoardUtils';
import { StateUtils } from '../../test_utility/StateUtils';
import { ActionType, Move } from '../../Common/Action';
import { SlideActionWithRotation } from '../../Common/Board/SlideAction';
import { Color, generateRandomColor } from '../../Utility/Color';
import { deserializeBoard } from '../../Serialize/Board';
import { deserializeTile } from '../../Serialize/GameState';
import { PublicPlayerState } from '../../Common/PublicPlayerState';
import { Random } from '../../Utility/Random';
import { TILE_UP_DOWN } from '../Tile/Tiles';
import { BasicTile } from '../../Common/Tile/Tile';
import { assertBoardsEqual } from '../Board/Board.test';
import { Coordinate } from '../../Common/Board/Coordinate';
import { GridSize } from '../../Common/Board/GridSize';

describe('Testing BasicGameState.constructor', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('GameState with players', () => {
    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    const avatars = gameState.getPlayerStates();
    players.forEach((player, i) => {
      expect(StateUtils.sameAvatar(avatars[i], player)).toBe(true);
    });
  });
});

describe('Testing BasicGameState methods with no players', () => {
  const playerState = StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 }));
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo> = ImmutableMap();
  playersInfo = playersInfo.set(
    playerState.color,
    {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    }
  );
  const gameState: GameState = new BasicGameState(
    [playerState],
    deserializeBoard(board1),
    deserializeTile(board1_spare_tile),
    playersInfo
  );

  gameState.kickPlayer(playerState.color)

  const slideAction: SlideActionWithRotation = {
    direction: HorizontalDirection.RIGHT,
    index: 0,
    rotations: 1
  };

  const move: Move = {
    type: ActionType.MOVE,
    slideAction: slideAction,
    moveTo: new Coordinate({ row: 0, column: 6 }),
  };

  const methodCalls = [
    () => gameState.getActivePlayerState(),
    () => gameState.activePlayerCanMoveTo(slideAction),
    () => gameState.isPlayerOnHome(generateRandomColor()),
    () => gameState.kickPlayer(generateRandomColor()),
    () => gameState.setNextActivePlayer(),
    () => gameState.trySlideActionAndUndo(slideAction, () => { }),
    () => gameState.executeAction(move),
  ];

  methodCalls.forEach(method => {
    expect(() => {
      method();
    }).toThrow(
      new LabyrinthError({
        message: 'There are 0 players in the GameState.',
        code: ErrorCode.NO_PLAYERS,
      })
    );
  });
});

describe('Testing BasicGameState.getBoard()', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo = ImmutableMap();
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
    assertBoardsEqual(gameState.getBoard(), deserializeBoard(board1));
  });

  test('GameState returns board2', () => {
    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board2),
      deserializeTile(board2_spare_tile),
      playersInfo
    );
    assertBoardsEqual(gameState.getBoard(), deserializeBoard(board2));
  });
});

describe('trying a slideAction and undoing does not affect the board', () => {
  const players = [
    StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
    StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
  ];
  let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
  for (const player of players) {
    playersInfo = playersInfo.set(player.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
  }

  const states: [GameState, Board][] = [
    [
      new BasicGameState(
        players,
        deserializeBoard(board1),
        deserializeTile(board1_spare_tile),
        playersInfo
      ),
      deserializeBoard(board1),
    ],
    [
      new BasicGameState(
        players,
        deserializeBoard(board2),
        deserializeTile(board2_spare_tile),
        playersInfo
      ),
      deserializeBoard(board2),
    ],
  ];

  describe('trying board actions does not affect the board or spare tile', () => {
    const tryMove = (
      state: GameState,
      originalBoard: Board,
      index: number,
      direction: Direction,
      rotations: number
    ) => {
      test(`testing moving row/col ${index} in direction ${direction} and rotating ${rotations}`, () => {
        const originalConnector = state.getSpareTile().connector;
        state.trySlideActionAndUndo({ index, direction, rotations }, () => { });
        assertBoardsEqual(state.getBoard(), originalBoard);
        expect(state.getSpareTile().connector).toBe(originalConnector);
      });
    };

    states.forEach(([state, originalBoard]) => {
      tryMove(state, originalBoard, 0, VerticalDirection.DOWN, 3);
      tryMove(state, originalBoard, 2, HorizontalDirection.LEFT, 1);
      tryMove(state, originalBoard, 0, HorizontalDirection.RIGHT, 2);
      tryMove(state, originalBoard, 2, VerticalDirection.UP, 0);
    });
  });
});

describe('Testing BasicGameState.getActivePlayer() and setActivePlayer()', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('GameState returns correct active player', () => {
    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    expect(gameState.getActivePlayerState()).toBe(players[0]);
  });

  test('GameState returns correct active player after switch', () => {
    const players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    let playersInfo: ImmutableMap<Color, PrivatePlayerInfo> = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    const gameState: GameState = new BasicGameState(
      players.map(p => ({ ...p })),
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    for (let i = 0; i < players.length; i++) {
      expect(gameState.getActivePlayerState().color).toEqual(players[i].color);
      gameState.setNextActivePlayer();
    }
  });
});

describe('Testing BasicGameState.removeActivePlayer()', () => {
  test('Without specified UUID', () => {
    const players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    let playersInfo: ImmutableMap<Color, PrivatePlayerInfo> = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    const originalPlayers = players.map(p => ({ ...p }));

    const gameState: GameState = new BasicGameState(
      players,
      deserializeBoard(board1),
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    gameState.kickPlayer(players[0].color);
    const avatars = gameState.getPlayerStates();
    expect(avatars.length).toBe(2);
    for (let i = 1; i < originalPlayers.length; i++) {
      expect(StateUtils.sameAvatar(originalPlayers[i], avatars[i - 1])).toBe(true);
    }
  });
});

describe('Testing BasicGameState.getPlayerStates', () => {
  test('GameState returns correct list of avatars', () => {
    const players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 3, column: 3 })),
      StateUtils.generateAvatar(new Coordinate({ row: 5, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    let playersInfo: ImmutableMap<Color, PrivatePlayerInfo> = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    const notInGamePlayer = StateUtils.generateAvatar();
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const avatars = gameState.getPlayerStates();
    for (let i = 0; i < players.length; i++) {
      expect(StateUtils.sameAvatar(players[i], avatars[i])).toBe(true);
      expect(StateUtils.sameAvatar(notInGamePlayer, avatars[i])).toBe(false);
    }
  });
});

describe('Testing BasicGameState.activePlayerCanReach()', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('GameState returns correct list of reachable positions for board1', () => {
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    const slideAction: SlideActionWithRotation = {
      rotations: 0,
      index: 0,
      direction: HorizontalDirection.LEFT,
    };

    const reachable = gameState.activePlayerCanMoveTo(slideAction);
    expect(reachable.size).toBe(1);
    expect(reachable.has(new Coordinate({ row: 0, column: 6 })));
  });

  test('GameState returns correct list of reachable positions for board2', () => {
    const board = deserializeBoard(board2);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board2_spare_tile),
      playersInfo
    );

    const slideAction: SlideActionWithRotation = {
      rotations: 0,
      index: 0,
      direction: VerticalDirection.UP,
    };

    const reachable = gameState.activePlayerCanMoveTo(slideAction);

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

describe('Testing BasicGameState.activePlayerOnGoal()', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    playersInfo = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };
  });

  test('GameState correctly determines player not on goal', () => {
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo.get(players[0].color)!.goto = new Coordinate({ row: 1, column: 1 });

    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    expect(gameState.isActivePlayerOnGoal()).toBe(false);
  });

  test('GameState correctly determines player is on goal', () => {
    const board = deserializeBoard(board1);
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 1, column: 1 }),
    };

    playersInfo.get(players[0].color)!.goto = new Coordinate({ row: 1, column: 1 });

    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );
    expect(gameState.isActivePlayerOnGoal()).toBe(true);
  });
});

describe('Testing making a move', () => {
  let players: PublicPlayerState[];
  let playersInfo: ImmutableMap<Color, PrivatePlayerInfo>;

  beforeEach(() => {
    players = [
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 1 })),
      StateUtils.generateAvatar(new Coordinate({ row: 1, column: 3 })),
    ];

    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };

    playersInfo = ImmutableMap();
    for (const player of players) {
      playersInfo = playersInfo.set(player.color, {
        goto: new Coordinate({ row: 1, column: 1 }),
        hasReachedAllGoals: false,
        treasuresCollected: 0,
        hasReturnedHome: false
      });
    }
  });

  test('Legal move is executed correctly', () => {
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: 0,
        rotations: 3,
      },
      moveTo: new Coordinate({ row: 0, column: 6 }),
    };

    const player = gameState.getActivePlayerState();
    const nextPlayer = gameState.getPlayerStates()[1];

    gameState.executeAction(move);
    assertBoardsEqual(gameState.getBoard(), BoardUtils.boardFromTileChars(board1_move1), true);

    const avatars = gameState.getPlayerStates();

    expect(avatars[0].color.equals(player.color)).toBe(true);
    expect(avatars[0].position).toEqual(new Coordinate({ row: 0, column: 6 }));
    expect(avatars[avatars.length - 1].color.equals(nextPlayer.color)).toBe(true);
  });

  test('Player wraps around', () => {
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 6 }),
    };
    const board = BoardUtils.boardFromTileChars(board1_wrap);
    const random = new Random('test1');
    const gameState: GameState = new BasicGameState(
      players,
      board,
      new BasicTile(board1_wrap.spareTile.connector, random.gemPair()),
      playersInfo
    );

    expect(
      gameState.getActivePlayerState().position.equals(new Coordinate({ row: 0, column: 6 }))
    ).toBe(true);

    expect(
      gameState
        .getBoard()
        .getAllConnectedTiles(new Coordinate({ row: 0, column: 6 }))
        .has(new Coordinate({ row: 0, column: 1 }))
    ).toBe(false);

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: 0,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 0, column: 1 }),
    };

    const player = gameState.getActivePlayerState();
    const nextPlayer = gameState.getPlayerStates()[1];

    gameState.executeAction(move);

    assertBoardsEqual(gameState.getBoard(), BoardUtils.boardFromTileChars(board1_wrap_move), true);

    const avatars = gameState.getPlayerStates();

    expect(avatars[0].color).toEqual(player.color);
    expect(avatars[0].position).toEqual(new Coordinate({ row: 0, column: 1 }));
    expect(avatars[avatars.length - 1].color.equals(nextPlayer.color)).toBe(true);
  });

  test('Board action on illegal row', () => {
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: -1,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 0, column: 1 }),
    };
    expect(() => {
      gameState.executeAction(move);
    }).toThrow(
      new LabyrinthError({
        message: 'Invalid move: row -1 is not slideable.',
        code: ErrorCode.BOARD_MOVE_OUT_OF_RANGE,
      })
    );
  });

  test('Board action on illegal col', () => {
    players[0] = {
      ...players[0],
      position: new Coordinate({ row: 0, column: 0 }),
    };
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: VerticalDirection.UP,
        index: 10,
        rotations: 0,
      },
      moveTo: new Coordinate({ row: 0, column: 1 }),
    };
    expect(() => {
      gameState.executeAction(move);
    }).toThrow(
      new LabyrinthError({
        message: 'Invalid move: column 10 is not slideable.',
        code: ErrorCode.BOARD_MOVE_INVALID_SELECTION,
      })
    );
  });

  test('Player move to unreachable coordinate', () => {
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: 0,
        rotations: 1,
      },
      moveTo: new Coordinate({ row: 1, column: 1 }),
    };

    expect(() => {
      gameState.executeAction(move);
    }).toThrow(
      new LabyrinthError({
        message: 'Player cannot move to a non-connected tile.',
        code: ErrorCode.PLAYER_CANNOT_MOVE_TO_TILE,
      })
    );
  });

  test('Player move to out of board range', () => {
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: 8,
        rotations: 1,
      },
      moveTo: new Coordinate({ row: 0, column: 0 }),
    };
    expect(() => {
      gameState.executeAction(move);
    }).toThrow(
      new LabyrinthError({
        message: 'Invalid move: row 8 is not slideable.',
        code: ErrorCode.COORDINATE_ELEMENT_NOT_INTEGER,
      })
    );
  });

  test('Player move to same spot', () => {
    const board = deserializeBoard(board1);
    const gameState: GameState = new BasicGameState(
      players,
      board,
      deserializeTile(board1_spare_tile),
      playersInfo
    );

    const move: Move = {
      type: ActionType.MOVE,
      slideAction: {
        direction: HorizontalDirection.RIGHT,
        index: 0,
        rotations: 1,
      },
      moveTo: new Coordinate({ row: 0, column: 1 }),
    };
    expect(() => {
      gameState.executeAction(move);
    }).toThrow(
      new LabyrinthError({
        message: 'Unable to move player to same position.',
        code: ErrorCode.PLAYER_MOVE_SAME_POSITION,
      })
    );
  });
});

describe('Testing State - Invalid board sizes and home uniqueness', () => {
  let random: Random;
  const gridSize2x2 = new GridSize({ rows: 2, columns: 2 });
  const gridSize4x2 = new GridSize({ rows: 4, columns: 2 });

  beforeEach(() => {
    random = new Random('test5');
  });

  const avatarHomesNotUnique = (
    board: Board,
    avatars: PublicPlayerState[],
    playersInfo: ImmutableMap<Color, PrivatePlayerInfo>
  ) => {
    expect(() => new BasicGameState(avatars, board, TILE_UP_DOWN, playersInfo)).toThrow(
      /Avatar homes must be unique/
    );
  };

  test('tests that boards that are too small for the num players fails 2x2', () => {
    const board = random.board(gridSize2x2);
    const avatar1 = random.avatar(gridSize2x2, 'test1');
    const avatar2 = random.avatar(gridSize2x2, 'test2');
    // In a 2x2 board, there is only 1 immovable tile.
    expect(avatar1.home.equals(avatar2.home)).toBe(true);

    let playersInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    playersInfo = playersInfo.set(avatar1.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });
    playersInfo = playersInfo.set(avatar2.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    avatarHomesNotUnique(board, [avatar1, avatar2], playersInfo);
  });

  test('tests that boards that are too small for the num players fails 4x2', () => {
    const board = random.board(gridSize4x2);
    const avatars = random.avatars(gridSize4x2, 2);
    const repeatAvatar = random.avatar(gridSize4x2, 'c');

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
    playersInfo = playersInfo.set(repeatAvatar.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    let repeatedHome = 0;
    for (const curAvatar of avatars) {
      if (repeatAvatar.home.equals(curAvatar.home)) repeatedHome++;
    }
    expect(repeatedHome).toBe(1);

    avatarHomesNotUnique(board, [...avatars, repeatAvatar], playersInfo);
  });

  test('tests avatar home or goal is not movable', () => {
    const board = random.board(gridSize2x2);
    const avatar1 = random.avatar(gridSize2x2, 'test1');
    const badAvatar1 = {
      ...avatar1,
      home: Coordinate.ORIGIN,
    };

    const badAvatar2 = {
      ...avatar1,
    };

    let badAvatar1Map = ImmutableMap<Color, PrivatePlayerInfo>();
    badAvatar1Map = badAvatar1Map.set(badAvatar1.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    let badAvatar2Map = ImmutableMap<Color, PrivatePlayerInfo>();
    badAvatar2Map = badAvatar2Map.set(badAvatar2.color, {
      goto: Coordinate.ORIGIN,
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    expect(() => new BasicGameState([badAvatar1], board, TILE_UP_DOWN, badAvatar1Map)).toThrow(
      /One or more provided avatars homes are on a moveable tile/
    );
    expect(() => new BasicGameState([badAvatar2], board, TILE_UP_DOWN, badAvatar2Map)).toThrow(
      /One or more provided avatars goals are on a moveable tile/
    );
  });

  test('tests goal sequence on board and on immovable coordinates', () => {
    const board = random.board(gridSize2x2);
    const avatar1 = random.avatar(gridSize2x2, 'test1');

    let privatePlayerMap = ImmutableMap<Color, PrivatePlayerInfo>();
    privatePlayerMap = privatePlayerMap.set(avatar1.color, {
      goto: new Coordinate({ row: 1, column: 1 }),
      hasReachedAllGoals: false,
      treasuresCollected: 0,
      hasReturnedHome: false
    });

    const goalSequenceOutOfBounds = [new Coordinate({ row: 3, column: 3 })];
    const goalSequenceMovable = [new Coordinate({ row: 0, column: 0 })];

    expect(() => new BasicGameState(
      [avatar1], board, TILE_UP_DOWN, privatePlayerMap, undefined, goalSequenceOutOfBounds
    )).toThrow(
      /One or more provided additional goals are not in the board/
    );
    expect(() => new BasicGameState(
      [avatar1], board, TILE_UP_DOWN, privatePlayerMap, undefined, goalSequenceMovable
    )).toThrow(
      /One or more provided additional goals are on a moveable tile/
    );
  });
});
