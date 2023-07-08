import {BoardUtils} from 'maze/test_utility/BoardUtils'
import {StateUpdate} from 'maze/Referee/ProcessObserver';
import {deserializeGameState} from 'maze/Utility/JSONGameState';
import {Coordinate} from 'maze/Common/Board/Coordinate';
import {Color} from 'maze/Utility/Color';
import Tile from './Tile';

/**
 * Displays a single Game State.
 */
export default function State({stateUpdate}: { stateUpdate: StateUpdate }): JSX.Element {
  const state = deserializeGameState(stateUpdate.state);
  const treasures = BoardUtils.retrieveBoardTreasures(state.getBoard());
  const tileStrings = BoardUtils.retrieveBoardStringTiles(state.getBoard());

  const homePositions: [Coordinate, Color][] = state.getPlayerStates().map(player => [player.home, player.color]);
  const playerPositions: [Coordinate, Color][] = state.getPlayerStates().map(player => [player.position, player.color]);
  const goalPositions: [Coordinate, Color][] = state.getPlayerStates().map(player => [state.getPlayerGoal(player.color), player.color]);

  const positionIn = (i: number, j: number) => (element: [Coordinate, Color]) => element[0].equals(new Coordinate({row: i, column: j}));

  const spareConnector = state.getSpareTile().connector;
  const [spareGem1, spareGem2] = state.getSpareTile().treasure.gems;

  return (
      <div className="App" style={{minHeight: '100vh', fontFamily: 'Arial'}}>
        <span><b>Legend:</b> Avatar Position: Circle | Avatar Home: Square</span>
        <table cellSpacing={0} style={{margin: 'auto'}}>
          {
            tileStrings[0].map((row: string[], i: number) =>
              <tr>
                {row.map((character: string, j: number) =>
                  <td style={{textAlign: 'center', width: '75px', height: '75px'}}>
                    <Tile tileStr={character} treasure={treasures[0][i][j]}
                    homeColors={homePositions.filter(positionIn(i, j)).map(x => x[1])}
                    playerColors={playerPositions.filter(positionIn(i, j)).map(x => x[1])}
                    goalColors={goalPositions.filter(positionIn(i, j)).map(x => x[1])}/>
                  </td>
                )}
              </tr>
            )
          }
        </table>

    <div style={{width: '100px', margin: 'auto'}}>
      <h5>Spare tile</h5>
        <div style={{width: '100px', textAlign: 'center'}}>
          <h1 style={{
            fontSize: '5em', position:'relative', padding: 0, margin: 0, height: '100px', width: '100px'}}>{spareConnector}</h1>

          <img style={{
            position: 'relative',
            height: '10px',
            width: 'auto'
          }} src={`./gems/${spareGem1}.png`}/>

          <img style={{
            position: 'relative',
            height: '10px',
            width: 'auto'
          }} src={`./gems/${spareGem2}.png`}/>
        </div>
      </div>
    </div>
  );
}
