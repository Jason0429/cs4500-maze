#### TO:         All Staff
#### FROM:       Zachar Hankewycz and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       November 10, 2022
#### SUBJECT:    Assumption Redesigns
#

We present the following ranking of difficulty for changing these assumptions:

- Blank tiles for the board
  - The difficulty to change this assumption would be a score of 2. This is because
    we can simply create a new implementation of `Tile` that represents a blank tile.
- Use moveable tiles as goals
  - The difficulty to change this assumption would be a score of 3. We would have to
    change what avatar stores as its goal; instead of a coordinate, it would store a
    treasure (or we can mutate the avatar everytime the treasure shifts). It would affect
    the `Strategy`, `State`, `StateInfo`, and/or `PlayerInfo`.
- Ask player to sequentially pursue several goals, one at a time.
  - The difficulty to change this assumption would be a score of 4. We would have to change
    the avatar to store a list of goals, rather than just a goal. Everytime a player reaches a goal, 
    we can pop it from the list of goals. This would affect `Player`, `Strategy`, `State`, `Referee`,
    `StateInfo`, and `PlayerInfo`.
