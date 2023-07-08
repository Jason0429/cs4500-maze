import { spawn } from 'child_process';
import { resolve } from 'path';
import { parseJSONStream } from '../test_utility/parseJSONStream';

const XCLIENT_PATH = resolve(__dirname, 'xclient.js');
const SPAWN_DELAY = 3_000;

parseJSONStream(process.stdin).then(async (data) => {
  const port = process.argv[2];
  const hostIP = process.argv[3];

  const playerSpecs = data[0] as unknown[];
  const args = [XCLIENT_PATH, port];

  if (port === undefined) {
    throw 'No port specified!'
  }

  if (hostIP !== undefined) {
    args.push(hostIP);
  }

  for (const ps of playerSpecs) {
    const child = spawn('node', args);
    child.stdout.pipe(process.stdout);
    child.stdin.write(JSON.stringify(ps));
    child.stdin.end();

    await new Promise((resolve) => { setTimeout(resolve, SPAWN_DELAY) });
  }
});
