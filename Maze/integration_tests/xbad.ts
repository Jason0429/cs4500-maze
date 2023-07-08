import { parseJSONStream } from '../test_utility/parseJSONStream';
import { Player } from '../Players/Player';
import { Referee, BasicReferee } from '../Referee/Referee';
import { deserializeRefereeStateWithPS } from '../Serialize/RefereeState';
import { GameState } from '../Common/State/GameState';
import { GridSize } from '../Common/Board/GridSize';

parseJSONStream(process.stdin).then(data => {
  const [gameState, players] = deserializeRefereeStateWithPS(data, true);

  badPlayerTest(gameState, players).then(result => {
    console.log(JSON.stringify(result));
    // Use process.exit to kill any remaining Players with infinite loops
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  });
});

async function badPlayerTest(
  gameState: GameState,
  players: Player[]
): Promise<[string[], string[]]> {
  if (players.length === 0) {
    return [[], []];
  }

  const size = gameState.getBoard().size;
  const referee: Referee = new BasicReferee(
    new GridSize({ rows: size.rows, columns: size.columns })
  );

  const result = await referee.runGame(players, gameState);
  const winners = await Promise.all(
    result.winners.toArray().map(player => player.name())
  );
  const kicked = await Promise.all(
    result.removed.toArray().map(player => player.name())
  );

  return [winners.sort(), kicked.sort()];
}
