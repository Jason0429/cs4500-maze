#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       October 13, 2022
#### SUBJECT:    Proposed Player-Referee Interface
#

We propose the following plan for the Player-Referee interface in the Labryinth game.

The player requires the data described here to make an informed decision:
- The board (connectors and treasures)
- The spare tile
- The player's goal
- All other players' positions on the board
- All other player' home positions
- The amount of players that have passed in this round

This plan will pertain to the mechanics of executing requested game actions for a Player. We will use the following data to create our wishlist for the Player interface.

```
interface PlayerInfo {
    readonly home: Coordinate;
    readonly position: Coordinate;
    readonly turn: number;
}

interface StateInfo {
    readonly board: Board; // NOTE: the spare tile is encapsulated by Board
    readonly playerInfo: Map<UUID, PlayerInfo>;
    readonly passedSoFar: number;
}

interface Player {
    getNextBoardAction: (stateInfo: StateInfo) => BoardAction;
    getNextMove: (stateInfo: StateInfo) => Coordinate;
}

interface PlayerBuilder {
    setUUID: (uuid: UUID) => PlayerBuilder;
    setTreasure: (treasure: GemPair) => PlayerBuilder;
    build: () => Player;
}
```

The above data definitions will be used as follows:

* `PlayerInfo` is an interface that contains data about a player such as position, home position, and turn.
* `StateInfo` is an interface that contains partial data about the game state that excludes information that the player should not know, i.e., treasures for each player. It contains the board, a map of players and `PlayerInfo`s, and 
the amount of players that have passed so far.
* Player is a referee-player interface that retrieves board actions and moves. The Player should have a private field that tracks their own treasure and ID to make sense of the data and goal state.
    - `getNextBoardAction` consumes a `StateInfo` and computes the next board action. When computing, it will take into account
    the information given by `StateInfo` about the board, spare tile, player positions and home positions. `getNextBoardAction` should be called when a player is granted a turn by the referee.
    - `getNextMove` consumes a `StateInfo` and computes the next tile to move to. Similar to `getNextBoardAction`, it will take all the data of `StateInfo` into account.
* `PlayerBuilder` is an interface to build an implementation of `Player`. It will set the ID and treasure of a `Player` before initializing it. `PlayerBuilder` is made intentionally to couple the idea of treasure and UUID with the `Player` interface. Therefore, the referee will always call this function to initialize the `Player`.
    - `setUUID` sets the private `UUID` of the player to the value given.
    - `setTreasure` consumes a `GemPair` and sets the private treasure of the player to the value given.