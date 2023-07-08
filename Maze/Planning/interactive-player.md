#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       October 27, 2022
#### SUBJECT:    Proposed Design for Interactive Player
#

We propose the following plan for an interactive Player for the Labryinth game.

All Labryinth players must be capable of performing the following:
- Registering with the referee, providing a player name.
- Allowing the user to propose a board of specified dimensions for use in the game.
- Displaying the board tiles while a game is in progress.
- Displaying the referee-assigned player avatar and goal.
- Displaying all other player avatars positions and homes.
- Allowing the user to make a valid action, consisting of a slide, rotation, insertion and move, or a pass.
- Notify the player of when the game is over and the winners.

To support all of these operations in a graphical and intuitive manner, the interactive player will consist of four "screens":

1. The player registration screen, in which a player selects a name and is given the option to join a game. Upon joining the game, the player is shown a waiting screen until the end of the registration period.
2. The board editor, which allows players to edit board's tiles and gems to submit to the referee during the setup phase.
3. The active game screen, which displays the current state of the board, all player avatars, and the spare tile. This screen also allows players to specify and submit an action when it becomes their turn.
4. The game result screen, which informs the player of the winners of the game.

In the board editor and active game screen, boards are displayed as a grid representing the tiles of the board. Within each grid cell, a connector shape represents the directions a player avatar can move in and two gem icons represent the treasures hidden within that tile.

Additionally, in the active game screen, colored circles will be used to display the positions of other players in the game. Above these circles, a text box will display the user-submitted name of the player. An icon will indicate the player's home tile in the board.

Also within the active game screen, three information sections will display the following information:
- Whether the player should move towards the goal tile or the home tile.
- A gem pair representing the player's assigned treasure.
- The current spare tile.
- A sequence of colored icons and names representing the upcoming player turns, with the first player in the list being the currently active player.
