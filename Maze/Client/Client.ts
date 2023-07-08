import * as net from 'node:net';
import { Readable, Writable } from 'node:stream';
import { Player } from '../Players/Player';
import { BasicDispatcher, Dispatcher } from '../Remote/Referee';
import type { Stream } from 'node:stream';
import {
  createJsonAssembler,
  handleEachSerializedDataValue,
  serializeAndSendToStream,
} from '../Utility/Serialize';
import { normalizePort } from '../Utility/Network';

const DEFAULT_HOST = '127.0.0.1';
const CONNECTION_REFUSED = 'ECONNREFUSED';
const CONNECTION_REFUSED_RE = new RegExp(CONNECTION_REFUSED);
const RECONNECT_DELAY = 500;

/**
 * Creates a client which communicates to the given server specified by {@link hostIP}
 * and {@link port} over TCP using serialized data.
 * Creates a client with the input/output stream of the newly constructed socket and the
 * given {@link Player}.
 * If there is no server at the address, retries the connection until it succeeds.
 */
export async function initializeTCPClient(
  port: string,
  player: Player,
  hostIP = DEFAULT_HOST
): Promise<void> {
  const clientSocket = new net.Socket();
  clientSocket.on('error', (err: Error) => handleOnError(clientSocket, port, hostIP, err));
  clientSocket.once('connect', () => initializeClient(player, clientSocket, clientSocket));
  attemptClientConnect(clientSocket, port, hostIP);
}

/**
 * Handles retrying connecting to the server specified by {@link hostIP} and {@link port}
 * after a {@link CONNECTION_REFUSED} error is thrown by the {@link clientSocket}.
 */
function handleOnError(clientSocket: net.Socket, port: string, hostIP: string, err: Error): void {
  if (CONNECTION_REFUSED_RE.test(err.message)) {
    setTimeout(() => attemptClientConnect(clientSocket, port, hostIP), RECONNECT_DELAY);
  }
}

/**
 * Handles connecting to the server specified by {@link hostIP} and {@link port}.
 */
function attemptClientConnect(client: net.Socket, port: string, hostIP: string) {
  client.connect(normalizePort(port), hostIP);
}

/**
 * Initializes handlers to send and receive serialized data over {@link Stream},
 * delegating method calls to the given {@link Player} and sending responses back.
 */
export async function initializeClient(
  player: Player,
  inputStream: Readable,
  outputStream: Writable
): Promise<void> {
  const dispatcher = new BasicDispatcher(player);
  const parser = createJsonAssembler(inputStream);
  await signupClient(outputStream, player);

  handleEachSerializedDataValue(parser, (data) => {
    handleSerializedDataValue(data, dispatcher, outputStream);
  });
}

/**
 * Signs a client up with the server by sending the {@link Player}'s serialized name
 * to the given {@link outputStream}.
 */
async function signupClient(outputStream: Writable, player: Player): Promise<void> {
  const playerName = await player.name();
  serializeAndSendToStream(outputStream, playerName);
}

/**
 * Takes in a unit of serialized data and delegates it to the given {@link Dispatcher}
 * which will deserialize the data, if valid, into a method call and delegate it to
 * the dispatcher's {@link Player}. The serialized response is written to the
 * given {@link outputStream}.
 */
async function handleSerializedDataValue(
  data: unknown,
  dispatcher: Dispatcher,
  outputStream: Writable
): Promise<void> {
  const result = await dispatcher.callPlayerMethod(data);
  serializeAndSendToStream(outputStream, result);
}
