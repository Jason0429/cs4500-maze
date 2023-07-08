import { deserializeRefereeState } from '../Serialize/RefereeState';
import { Server } from '../Server/Server';
import { parseJSONStream } from '../test_utility/parseJSONStream';

parseJSONStream(process.stdin).then(data => {
  const gameState = deserializeRefereeState(data[0]);
  const port = process.argv[2];
  if (port === undefined) {
    throw 'No port specified!'
  }

  const server = new Server(port);

  server.runGameServer(gameState).then(result => {
    const winners = [...result[0]].sort();
    const kicked = [...result[1]].sort();
    console.log(JSON.stringify([winners, kicked]));
  });
});
