import { initializeTCPClient } from '../Client/Client';
import { deserializeTestPS } from '../Serialize/PS';
import { parseJSONStream } from '../test_utility/parseJSONStream';

parseJSONStream(process.stdin).then(data => {
  const playerSpec = deserializeTestPS(data[0]);
  const port = process.argv[2];
  if (port === undefined) {
    throw 'No port specified!'
  }
  const hostIP = process.argv[3];

  initializeTCPClient(port, playerSpec, hostIP);
});
