#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       Octover 7, 2022
#### SUBJECT:    Proposed Data Representation for the Game State
#

We propose the following plan for representing the game state in our Labryinth game.

### 1. The `GameState` interface.

The `GameState` is a complete record of all information about the ongoing game. It is intended to be used by a referee to facilitate a session of the game.

This interface will provide operations to determine the state of the Board, determine the validity of player actions and execute them, as well as track the current status of the game and player turns.

TypeScript data representation:

```GameState.ts
interface GameState {
    /**
     * Access the current board.
     * 
     * @returns The current board.
     */
    getBoard: () => Board;

    /**
     * Query the current status of the game.
     *
     * @returns The current {@link GameStatus}.
     */
    getGameStatus : () => GameStatus;

    /**
     * Determines the {@link Player} who may execute a move next.
     *
     * @returns A reference to the {@link Player} whose turn it is.
     */
    getCurrentTurnPlayer : () => Player;

    /**
     * Determines whether a {@link Move} is legal.
     *
     * @returns Whether the provided move is valid.
     */
    validateMove: (move : Move) => boolean;
}

enum GameStatus {
    ONGOING = 'ONGOING',
    WIN = 'WIN',
    TIE = 'TIE'
}
```

### 2. The `Player` interface.

Specific information about a player's current position and goal and home tiles is stored in this interface.

TypeScript data representation:

```Player.ts
interface Player {
    /**
     * A random and unique string identifier for the player.
     */
    id: UUID;

    /**
     * The current location of the player on the board.
     */
    position: Coordinate;

    /**
     * The location of the player's home tile.
     */
    home: Coordinate;

    /**
     * The treasure goal assigned to the player.
     */
    goal: GemPair;
}
```

#

*Note that these interface designs are not comprehensive and are subject to change.*