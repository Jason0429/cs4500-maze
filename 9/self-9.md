**If you use GitHub permalinks, make sure your link points to the most recent commit before the milestone deadline.**

## Self-Evaluation Form for Milestone 9

Indicate below each bullet which file/unit takes care of each task.

Getting the new scoring function right is a nicely isolated design
task, ideally suited for an inspection that tells us whether you
(re)learned the basic lessons from Fundamentals I, II, and III. 

This piece of functionality must perform the following four tasks:

- find the player(s) that has(have) visited the highest number of goals
- compute their distances to the home tile
- pick those with the shortest distance as winners
- subtract the winners from the still-active players to determine the losers

The scoring function per se should compose these functions,
with the exception of the last, which can be accomplised with built-ins. 

1. Point to the scoring method plus the three key auxiliaries in your code. 
- https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/blob/7bca0a5874014753800087020a3253a715857469/Maze/Referee/Referee.ts#L202-L228
- https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/blob/7bca0a5874014753800087020a3253a715857469/Maze/Referee/Referee.ts#L230-L247
- https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/blob/7bca0a5874014753800087020a3253a715857469/Maze/Referee/Referee.ts#L524
  - This is not an auxiliary function in and of itself, but it is distinct from the main "calculate winners" function. In our case, subtracting the winners from the still-active players to determine the losers was a very simple task, and we did not feel it was worth breaking out into another function (it's one very small line of code)
- We did not write a distinct auxiliary function for finding the players that have visited the highest number of goals.

2. Point to the unit tests of these four functions.

We did not write unit tests for these functions, as they are all private methods.

However, we do have tests that evaluate the result of these functions in a larger context (eg. through running the game to completion), such as [this](https://github.khoury.northeastern.edu/CS4500-F22/stoic-mustangs/blob/7bca0a5874014753800087020a3253a715857469/Maze/unit_tests/Referee.test.ts#L216-L227)

---- 

The ideal feedback for each of these three points is a GitHub
perma-link to the range of lines in a specific file or a collection of
files.

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

You may wish to add a sentence that explains how you think the
specified code snippets answer the request.

If you did *not* realize these pieces of functionality, say so.

