Pair: stoic-mustangs \
Commit: [ec7fe2f9cc63d418bca00139198374164c20a6e0](https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/tree/ec7fe2f9cc63d418bca00139198374164c20a6e0) \
Self-eval: https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/blob/8845bcc9fc4bf213e616e74105d20c43b413fbbe/9/self-9.md \
Score: 68/100\
Grader: Alexis Hooks

<hr>

#### SELF EVALUATION [20/20]

[20/20] - accurate and helpful self eval

<hr>

#### PROGRAM INSPECTION [48/80]

##### Expectations

The top-level scoring function must perform the following tasks:

- find the player(s) that has(have) visited the highest number of goals
- compute their distances to the home tile
- pick those with the shortest distance as winners
- subtract the winners from the still-active players to determine the losers
  
The first three tasks should be separated out as methods/functions:

1. Find player(s) that has(have) visited the highest number of goals.
2. Compute player distances to next goal.
3. Find player(s) with shortest distance to next goal.

##### Points

- [26/40] Each of these functions should have a good name or a purpose statement
  - [0/10] top-level scoring function
    - this function must also perform the task of subtracting the winners from the still-active players to determine the losers
  - [6/10] find the player(s) that has(have) visited the highest number of goals
    - this functionality needs to be factored out
    - partial credit for honesty
  - [10/10] compute player distances to the home tile
    - this functionality needs to be factored out
  - [10/10] pick players with the shortest distance as winners

- [22/40] Each of these functions should have unit tests
  - [12/20] unit tests for scoring method
    - partial credit for honesty
  - [10/10] for a unit test that covers no players in the game at the time of scoring OR purpose statements / data interpretations indicate the state comes with at least one active player
  - [0/10] or a unit test that covers scoring a game where multiple players have the same number of goals
  
<hr>

GENERAL NOTE:
- Make sure to obey the changes to the spec: "If the game-terminating player is one of the players with the highest number of collected treasures, it is the sole winner."

