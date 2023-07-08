import { parseJSONStream } from '../test_utility/parseJSONStream';
import { Player } from '../Players/Player';
import { BasicReferee, Referee } from '../Referee/Referee';
import { Observable, Observer } from '../Referee/Observer';
import { ProcessObserver } from '../Referee/ProcessObserver';
import { deserializeRefereeStateWithPS } from '../Serialize/RefereeState';
import { GameState } from '../Common/State/GameState';
import { GridSize } from '../Common/Board/GridSize';

/**
 * Runs the xgames integration test. If the optional --observer flag is included,
 * a {@link ProcessObserver} will be attached.
 */
parseJSONStream(process.stdin).then(data => {
  const [refereeState, players] = deserializeRefereeStateWithPS(data, true);
  const observer = getObserver();
  refereeStateTest(refereeState, players, observer).then(winners =>
    console.log(JSON.stringify(winners.sort()))
  );
});

/**
 * Create a game state from the bindings, create a referee,
 * bind an observer and return the winner of the resulting game.
 */
export async function refereeStateTest(
  gameState: GameState,
  players: Player[],
  observer?: Observer
): Promise<string[]> {
  if (players.length === 0) {
    return [];
  }

  const size = gameState.getBoard().size;
  const referee: Referee & Observable = new BasicReferee(
    new GridSize({ rows: size.rows, columns: size.columns })
  );

  if (observer !== undefined) referee.attachObserver(observer);

  const result = await referee.runGame(players, gameState);
  const winners = await Promise.all(
    result.winners.toArray().map(player => player.name())
  );
  return winners.sort();
}

/**
 * Creates a new {@link ProcessObserver} if the '--graphical'
 * flag is passed.
 */
function getObserver(): Observer | undefined {
  if (process.argv.includes('--observer')) {
    return new ProcessObserver();
  } else {
    return undefined;
  }
}
