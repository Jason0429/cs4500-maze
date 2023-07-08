# The Game: Labyrinth

The chosen game is inspired by Labyrinth. 


## Overview
#

The Labyrinth game takes place in a maze of twisty passages. Players navigate these passages, retrieved treasures, and race back to their home.
- The game board is a rectangular grid of tiles. Each tile displays one of these Connector shapes: │, ─, ┐, └, ┌, ┘, ┬, ├, ┴, ┤, ┼. Since a player may rotate tiles by multiples of 90deg, there are really just four canonical shapes: │, └, ┬, ┼. These shapes connect tiles to each other if the ends of the shapes touch. In addition, every tile comes with a unique and unordered pair of The Gems, referred to as the treasure.
- The key complication is that every other row and column can slide in either direction. The outermost rows and columns are movable. A row or column can be moved by one tile at a time, which means one falls off and one spot on the grid is without a tile.
- The referee sets up the board, picks one spare tile, assigns players a home, and tells each player which treasure is to be retrieved and brought home.
- A player performs a turn in three steps. Step 1 is to slide a row or a column by one tile. Step 2 is to rotate the spare tile and put it into the free spot on the grid. Step 3 is to move the player to any tile that is reachable according to the connectors on the tiles. The first player to wrap up the hunt for treasure is the winner; everyone else is a loser.

The initial board game size should be a 7x7 grid, with four movable rows and four movable columns.

### Pieces
#

The game comes with a grid, enough tiles to populate each spot on the grid, and one spare tile. It also has (fake versions of) the gems specified in The Gems. Finally, the set includes player tokens of distinct colors and home tokens of corresponding colors.

### Setting up the Game
#

The referee sets up the board according to the above description. A spare tile is placed on the side. Finally, the referee assigns each player a home tile and—privately—a goal tile. Both homes and goals are on fixed tiles.

### Playing a Turn
#

After all players are set up, the game begins. The referee grants players turns, starting with the youngest one (and continuing by ascending age). At each turn a player must pass and do nothing or take action as follows:

- Slide tiles
- Pick a movable row or column. Slide all the tiles of that row/column over by one cell either left/right or up/down. This dislodges one tile at the end of that row/column. The dislodged tile becomes the new spare.
- The player must not undo the previous sliding action.
- Insert spare: The player takes the old spare tile, rotates it by a multiple of 90deg, and places it into the grid where the sliding of a row or column left a hole.
- Move avatar: Once the first two steps are completed, the player’s avatar must be moved through the connected pathways of the labyrinth. It may not remain on the tile where it is located in this re-configured board.

### Ending a Game

- The first player to return home after visiting the assigned treasure is the winner. The game ends.
- The game also ends if every player chooses not to move during one round.

##

## Milestones
#

### Milestone 1 Summary:

We have designed data representations that will support the following pieces of functionality: 
- sliding a designated row or column in one or the other direction
- inserting a tile into the spot that is left open by a slide
- determining which tiles are reachable from a designated tile

Additionally, we have also designed a representation for the game interface, which will:
- Track turns
- Decide the validity of actions
- Determine and record the end of the game.