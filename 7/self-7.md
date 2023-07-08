**If you use GitHub permalinks, make sure your link points to the most recent commit before the milestone deadline.**

## Self-Evaluation Form for Milestone 7

Indicate below each bullet which file/unit takes care of each task:

The require revision calls for

    - the relaxation of the constraints on the board size
    - a suitability check for the board size vs player number 

1. Which unit tests validate the implementation of the relaxation?

There is no explicit unit tests that validates the implementation of the relaxation of this constraint. However,
we do have a unit test in `Strategy.test.ts` that uses a board that is not a 7x7.

https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/d99509dfc35f13ec88f389bcd36cdfad93d4572f/Maze/unit_tests/Strategy.test.ts#L56-L73
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/d99509dfc35f13ec88f389bcd36cdfad93d4572f/Maze/test_utility/BoardUtils.ts#L324-L333

https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/d99509dfc35f13ec88f389bcd36cdfad93d4572f/Maze/unit_tests/Strategy.test.ts#L75-L93
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/d99509dfc35f13ec88f389bcd36cdfad93d4572f/Maze/test_utility/BoardUtils.ts#L336-L345

2. Which unit tests validate the suitability of the board/player combination? 
We do not have a test validating the suitability of the board/player combination.
   
The ideal feedback for each of these three points is a GitHub
perma-link to the range of lines in a specific file or a collection of
files.

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

You may wish to add a sentence that explains how you think the
specified code snippets answer the request.

If you did *not* realize these pieces of functionality, say so.

