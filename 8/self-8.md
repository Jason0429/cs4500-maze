**If you use GitHub permalinks, make sure your link points to the most recent commit before the milestone deadline.**

## Self-Evaluation Form for Milestone 8

Indicate below each bullet which file/unit takes care of each task.

For `Maze/Remote/player`,

- explain how it implements the exact same interface as `Maze/Player/player`
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Remote/Player.ts#L19
- explain how it receives the TCP connection that enables it to communicate with a client
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Remote/Player.ts#L23-L29

Note: our implementation takes a readable input stream, and a writable output stream. This generalizes the use of our remote player to more than just TCP, and makes testing much easier. To use TCP with this implementation, we can simply pass the Socket connection as both the readable and writable stream. 
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Server/Server.ts#L86

The TCP connection comes from here in the server:
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Server/Server.ts#L130-L137
- point to unit tests that check whether it writes JSON to a mock output device

https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/unit_tests/Remote/Server/Player.test.ts

-----

For `Maze/Remote/referee`,

- explain how it implements the same interface as `Maze/Referee/referee`

It does not. We were under the impression that the role of the remote Referee was simply to accept messages, parse them, call the corresponding methods on its Player (if the messages are valid), and return the serialized result. We did not implement the Referee interface.
- explain how it receives the TCP connection that enables it to communicate with a server
https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Client/Client.ts#L17-L25
It does not directly handle the TCP connection — rather, every time our input stream reads a JSON value, that value is delegated to our remote referee.
- point to unit tests that check whether it reads JSON from a mock input device

https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/unit_tests/Remote/Client/Referee.test.ts

-----

For `Maze/Client/client`, explain what happens when the client is started _before_ the server is up and running:

- does it wait until the server is up (best solution)
- does it shut down gracefully (acceptable now, but switch to the first option for 9)

Neither — we neglected to implement this. It does not exit gracefully.

-----

For `Maze/Server/server`, explain how the code implements the two waiting periods:

- is it baked in? (unacceptable after Milestone 7)
- parameterized by a constant (correct).

The durations of the waiting periods are held in at a single point of control as constants.

https://github.khoury.northeastern.edu/CS4500-F22/whimsical-mongooses/blob/5a37bd763afd9cce1572ea999f5ea3b072c1c5fc/Maze/Server/Server.ts#L17-L18

The ideal feedback for each of these three points is a GitHub
perma-link to the range of lines in a specific file or a collection of
files.

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

You may wish to add a sentence that explains how you think the
specified code snippets answer the request.

If you did *not* realize these pieces of functionality, say so.

