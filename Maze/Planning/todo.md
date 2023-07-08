#### TO:         All Staff
#### FROM:       Zachar Hankewycz and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       November 11, 2022
#### SUBJECT:    Refactoring TO-DO
#

### Commits relating to only TODO.md
- `fbf4b7a4ae3b73e6fcb38957bf5ef69bf343c456`
- `a07aab97007f94edcd136b59d7424ffda2763927`
- `a07aab97007f94edcd136b59d7424ffda2763927`
- `9db847bd3de07b20c0f4f210a8934046d06ba576`
- `bbf37dd6c478ee2dec9e07757b3889c2212c7975`
- `5b59381346a2775c1de86e5fde662059bfc1adfd`

### Done

- [Bug] Referee handing errors in `Player.won` - if the player throws an error when `won` is called, the `Referee` should kick that player, and add it to the kicked players list (and remove it from the winning players list). All other winners/kicked players remain the same.
    - `7a3cf003d8975deb75d644604b26c88c5458ce24` - Kick Players at `won`
    - `ca6f4e5bedb7764d660feb646268eb9c14742ecf` - Fixed bug that does not (a)wait for `player.win` to finish
- [Feature] All `Player` methods should be asynchronous to prepare for potential distributed systems
    - `402554a0c32d10f4bfd7058c27f76ee99b5a5fa2` - Convert Player methods to async
- [Test] Add tests to check that `Players` get kicked if their method call takes longer to return than a set timeout
    - `2c884f8e40e41cce45119bd0e77e788e73ab20fd` - Ensure that players get kicked if they take longer than their timeout
    - `044b0a3a048431ae95f61d1451e287b4a813774f` - Add additional tests for player timeouts (test `takeTurn` and `win`; the previous one only tested `takeTurn`)
    - `7fa60aefeaf8864cf8232b2bdf29e0bf7bac0bbd` - Removed fix.only from test to run all referee tests (typo)
- [Utility] Add a shell script to run integration tests and check their expected output
    - `0edf54cfd6be91d731c0c20fb177cd8877acae5e` - Add shell script to execute single test cases
    - `84aaf77179c74acf5fc111382f16d682cb11f927` - Patch up all integration tests (for the shell script)
- [Refactoring] `Players` and `Avatars` should be identified by their `Color`s, not the UUIDs
    - `3d5a5de26b5f46161c22c29b6fa3cf992d105d49` -  Refactored player-avatar to use color instead of UUID 
- [Refactoring] `GameState` - add a method to execute a `BoardAction`, and call a callback on that new `GameState`. The altered `GameState` should not be accessible outside the function, returns the callback results.
    - `c4d903a7d6860892353fb5d136fdfef132d78398` -  Refactored StateInfo to return a StateInfo after executing a board action
- [Bug] `Board.ensureGridIsRegular` - a board with row lengths of zero should not pass this method.
    - `32a079e99654a668c376bfe73d1b93628941d389` -  Added check for board for non-zero row lengths + removed unusued/duplicated code
- [Documentation] `Tile.rotate` and `Board.rotate` don't specify in which direction they rotate (counter/clockwise)
    - `7172045473fb7a4affaa1029285c1fff188f24bc` - Added to docstring showing that a BoardAction may rotate 90 degrees clockwise direction
- [Refactoring] `Board.shiftRowAndReplace` use shift/pop and unshift/pop
    - `20da6565e7ad1b7a34850989b4aead7472309f83` - Refactored Board.shiftRowAndReplace to use shift/push and unshift/pop
- [Utility] Add a shell script to compile, run, and automate the checking of output of all integration tests
    - `9b4ea8da875ef262e55cd0c4a904693dd4d24e87` - Add a shell script to compile, run, and automate the checking of output of all integration tests
- [Refactoring] `Board.getConnectedDfs` - use `getTile` and abstract out to prepare for checking one coordinate
    - [Feature] The `Board` should have a method to determine if one coordinate is reachable from another coordinate in an __efficient__ manner (ie. not finding all reachable coordinates and checking for set membership).
        - `6c8540d833211a35a060dcea6e724cfa10eb2875` - `Board.getConnectedDfs` - use `getTile` and abstract out to prepare for checking one coordinate
- [Documentation] `Coordinate` and `GridSize` should mention that their params are natural numbers (and throws an error elsewise) in the comment
    - `ac44c7e7630bbaf650cf1b282778a51b3b24fb60` - `Coordinate` and `GridSize` should mention that their params are natural numbers (and throws an error elsewise) in the comment
- [Documentation] `Board > Coordinate` has the comment from `GridSize` copied 
    - `ac44c7e7630bbaf650cf1b282778a51b3b24fb60` - Updates `Coordinate`'s comment to properly reflect its contents
- [Nit] `Player` can take `state` as an optional argument for `setup` (instead of explicitly undefined)
    - `d280d70794ed75ab18d61cc63f551acf3b395b6c` - `Player` can take `state` as an optional argument for `setup` (instead of explicitly undefined)
- [Nit] `Number` shadows the global JS-provided `Number` utility
    - `516aea1a68d0e0a11838998d4ab62d4a1fa135f4` - `Number` shadows the global JS-provided `Number` utility; rename it
- [Refactoring/Nit] `BoardAction.boardActionsAreOpposites` can be refactored out to a function that gets the opposite direction
    - `93598e496dd7a1670280904542f05a09339bdd56` - `BoardAction.boardActionsAreOpposites` can be refactored out to a function that gets the opposite direction
- [Refactoring/Nit] `Tile` can store the given `ConnectorDirections` internally instead of destructuring immediately
    - `9ab674ddb76e80abaafb000cd59ef7f66ee540bb` - `Tile` can store the given `ConnectorDirections` internally instead of destructuring immediately
- [Test] `Board.ensureTreasuresAreUnique` - write a test case which does not successfully pass this method
    - `e7fb9bc6971518ccf141ae6233b1290dfec47d39` - `Board.ensureTreasuresAreUnique` - write a test case which does not successfully pass this method
- [Refactoring] `Strategy.getReachableWithDirection` should not assume all even indexed row/columns are slideable, and should delegate to rows/column
    - `8d8ba82b917d129f40ba9dfb17a376c6e548b0b9` - `Strategy.getReachableWithDirection` should not assume all even indexed row/columns are slideable, and should delegate to rows/column
    - `1baeb17d6466a4f8040e0408b1d093d7c71f7828` - Add the isColumnSlideable/Row to the Board's execute action method
- [Refactoring] `Strategy.getReachableWithPositionDirection` — if the board action undoes the last one, it still tried all 4 rotations, even though we know none of them will work
    - change boardActionsAreOpposites to use a Pick type
    - `62012377ee6f064eadd212d44024f794dc268708` - `Strategy.getReachableWithPositionDirection` — if the board action undoes the last one, it still tried all 4 rotations, even though we know none of them will work
- [Refactoring] Add a rule-checking utility class
    - `e2a5f255d9b0ca7db580239b9b3161a7e9579aee` - Add a rule-checking utility class
- [Refactoring] `State.ensureInBoardRange` — delegate this to this.board.size.coordinateInRange, it does the exact same thing
    - `2acab2a5a0bc37646d8c5ef2b81c11341c207d17` - `State.ensureInBoardRange` — delegate this to this.board.size.coordinateInRange, it does the exact same thing
- [Refactoring] `oddCoordinate` shouldn't rely on the fact that odd coordinates are not slideable
    - `86fc73d2ffd4457e4c09a590f0d4e49b6df1e8d7` - `oddCoordinate` shouldn't rely on the fact that odd coordinates are not slideable
- [Refactoring] Referee.playRounds — break the maxRounds into a separate constant
    - `deed731d7bc8adc587fa00df2f751149e2d99fae` - Referee.playRounds — break the maxRounds into a separate constant
- [Refactoring] BasicPlayer — winner shouldn't be initialized to false, since it isn't a loser (yet). 
    - `121df95bd1759a74ce7beb03de8d1bc963b21d74` - BasicPlayer — winner shouldn't be initialized to false, since it isn't a loser (yet). 
- [Bug] Ensure that the min. board size is 2x2
    - `32c802b48bf73eae8827078f00c3e8e3415faeba` - Added a check to ensure the board size is at least a 2x2
  
- [Bug] `Referee.ensureBoardSizeCorrect` should ensure that boards of are a minimum size, not of an exact size.
- [Bug] `Player.setup` should not reference players by name, b/c they're not guaranteed to be unique. Also should not keep track of the color, since the state given to us in `takeTurn` is guaranteed to have the active player as our player. Also, for the time being, we have no way of consistently associating a player with a Color.
- [Bug] `Referee.playRound` — if we use this.playerMap.size, this may change as players are kicked. Break this out into a separate constant first
- [Documentation] Remove all references to UUIDs (in comments and in errors)
- [Refactoring] Include the goal tiles in the observer
- [Refactoring] `State.findAvatarIndex` can take a readonly Avatar[] - no need to create a copy before passing to it
- [Refactoring] `Referee.attemptTurn` has an active player check which should be in `activePlayerMethod`
- [Documentation] `Referee` - Bottom of doc requires purpose statements (like `AttemptMethodResult`)
- [Refactoring] `State.isPlayerOnHome/Goal` - abstract into a single function.
- [Refactoring] `Referee.playerMap` — should not be ordered, parallel data structure
- [Refactoring] `State.isPlayerOnHome/Goal` - abstract into a single function.
    - `bcfe75400d3586d06f187b7057ab1bdb62693d68` - Finished the rest of the TODO
    - `b377b3a14ae074f5613139d649b2572dc82786eb` - should ensure that boards of are a minimum size, not of an exact size.
    - `0cdad67cc89cf34d44c9807e6c487d3bbf61032f` - Merge branch 'main' of github.khoury.northeastern.edu:CS4500-F22/whim…
    - `742733b42441d67b12f924e3ccabf357848bc47f` - Merge branch 'main' of github.khoury.northeastern.edu:CS4500-F22/whim…
    - `fc828eb90378cd1c0d8564cc5c32757a7695fae8` - State.isPlayerOnHome/Goal - abstract into a single function.
    - `ea717c04876487dae7ff3b7e4f50b66b028851da` - Merge branch 'main' of github.khoury.northeastern.edu:CS4500-F22/whim…
    - `b377b3a14ae074f5613139d649b2572dc82786eb` - `Referee.ensureBoardSizeCorrect` should ensure that boards of are a minimum size, not of an exact size.

NOTE: The last few TODOs were finished within a couple of big commits (along with merges) for the sake of time.
