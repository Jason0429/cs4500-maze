const MIN_TCP_PORT = 1;
const MAX_TCP_PORT = 65_000;

/**
 * Given a string representing a port number, attempt to convert it to an integer.
 */
export function normalizePort(port: string): number {
  const portInt = Number.parseInt(port);
  if (portInt < MIN_TCP_PORT || portInt > MAX_TCP_PORT) {
    throw 'Invalid port';
  }
  return portInt;
}
