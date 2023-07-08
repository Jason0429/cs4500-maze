### To: Professor Felleisen

### From: Zachar Hankewycz and Jason Cheung

### Date: December 1, 2022

### Subject: Milestone 9 Revisions

## General Refactoring
- Please see the top-level (not the one in the `Maze` directory) `README.md` file.
- Concise summary:
  - Refactored `Tile` class to internally compose `ConnectorDirections`.
  - Refactored `Board` to be mutable and to not include a spare `Tile`.
  - Refactored `Avatar` (now `PublicPlayerState`) to only include public information.
  - Refactored `GameState` to compose `StateInfo` (now `PublicGameState`) and to delegate method calls.
  - Refactored `GameState`/`PublicGameState` to be mutable and added spare `Tile`.
  - Added all past integration tests from testfests and parallelized integration test runner.

## Multiple Goals
- For each player, track:
  - the number of treasures collected.
  - whether the player has collected all of their treasures or not.
  - whether the player has returned home after collecting all of their treasures (to account for edge case in @241).
- Updated how the `Referee` calculates winners.
- Added support to the `Referee` for taking a list of goals.
- When a player reaches a goal, the `Referee` calls `setup` with a new goal from the list of goals, if any exist. Otherwise, call `setup` to home.
- Write unit tests for multiple goals.
