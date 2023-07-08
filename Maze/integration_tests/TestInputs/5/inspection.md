Pair: hankewyczz-jasoncheung \
Commit: [3eb7ccd875648f6ce1cb3eea6027d07d89abcf91](https://github.khoury.northeastern.edu/CS4500-F22/hankewyczz-jasoncheung/tree/3eb7ccd875648f6ce1cb3eea6027d07d89abcf91) \
Self-eval: https://github.khoury.northeastern.edu/CS4500-F22/hankewyczz-jasoncheung/blob/21c7a617cb3e5e9b64769cec95513b69eebffdd0/5/self-5.md \
Score: 156/160 \
Grader: Alexis Hooks

Great Job!

<hr>

SELF EVAL **[20/20]**:

- [20/20] - helpful and accurate self-eval

<hr>

PROGRAMMING TASK **[106/110]**:

[50/50] - The `Player` should have the following functionality with good names, signatures/types, and purpose statements.

- [10/10] - `name`
- [10/10] - `propose board`
- [10/10] - `setting up`
- [10/10] - `take a turn`
- [10/10] - `did I win`

<br>

[40/40] - The `Referee` should have the following functionality with good names, signatures/types, and purpose statements.

- [10/10] setting up the player with initial information
- [10/10] running rounds until the game is over
- [10/10] running a round, which must have functionality for
  - checking for "all passes"
  - checking for a player that returned to its home (winner)
- [10/10] score the game

<br>

[16/20] - Unit Tests

- [10/10] a unit test for the referee function that returns a unique winner
- [6/10] a unit test for the scoring function that returns several winners
  - admitting that the functionality was not present

NOTE:
* Your referee should be able to initialize/run a game without needing a gamestate to be passed in as an argument to RunGame.
* Every referee call on the player should be protected against illegal behavior and infinite loops/timeouts/exceptions. This should be factored out into a single point of control.

<hr>

DESIGN TASK **[30/30]**:

- [10/10] rotates the tile before insertion
- [10/10] selects a row or column to be shifted and in which direction
- [10/10] selects the next place for the player's avatar


