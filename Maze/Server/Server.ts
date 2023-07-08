import * as net from 'node:net';
import { BasicPlayer, Player } from '../Players/Player';
import { BasicReferee } from '../Referee/Referee';
import { GameState } from '../Common/State/GameState';
import { executeMethodOrTimeout } from '../Utility/Function';
import { Duplex } from 'node:stream';
import { StreamPlayer } from '../Remote/Player';
import { normalizePort } from '../Utility/Network';
import { createJsonAssembler, handleNextSerializedDataValue } from '../Utility/Serialize';
import { isString } from '../Serialize/utils';

/**
 * The minimum number of players required to run a game of Maze.
 */
const MIN_PLAYERS = 2;
/**
 * The maximum number of players which can be included in a single game of Maze.
 */
const MAX_PLAYERS = 6;
/**
 * The maximum number of milliseconds that a registration period should last.
 */
const REGISTRATION_PERIOD_LENGTH_MS = 20_000;
/**
 * The maximum number of registration periods to run before cancelling the game.
 */
const MAX_REGISTRATION_PERIODS = 2;
/**
 * The maximum number of milliseconds to wait for a client to send its name during
 * the sign-up process.
 */
export const MAX_NAME_WAITING_LENGTH_MS = 2_000;

/**
 * Describes the phase of the server; either it is in the registration or game phase.
 */
enum Phase {
  REGISTRATION = 'REGISTRATION',
  GAME = 'GAME',
}

/**
 * Represents an array of winner and kicked names.
 * The first list is a list of winner names.
 * The second list is a list of kicked names.
 */
type NamesResult = [string[], string[]];

/**
 * A server for connecting remote players and running Maze game.
 */
export class Server {
  /**
   * A list of clients represented by their socket and name.
   */
  private clients: Array<[net.Socket, string]>;

  /**
   * The current phase of the server.
   * Can either be in the {@link Phase.REGISTRATION} or {@link Phase.GAME} phase.
   */
  private currentPhase: Phase;

  /**
   * The internal TCP server.
   */
  private server: net.Server;

  constructor(port: string) {
    this.clients = [];
    this.currentPhase = Phase.REGISTRATION;
    this.server = net.createServer(client => this.clientConnectionCallback(client));
    this.server.listen(normalizePort(port));
  }

  /**
   * Handles accepting client registration and running the game
   * (if conditions to start are satisfied) given a {@link GameState}.
   * Returns empty results if game was unable to start.
   * Otherwise, returns the results of the completed game.
   */
  public async runGameServer(gameState: GameState): Promise<NamesResult> {
    await this.handleClientRegistration();

    // Refuse to accept new connections
    this.server.close();

    let result: NamesResult;
    if (this.clients.length < MIN_PLAYERS) {
      result = [[], []];
    } else {
      result = await this.runGame(gameState);
    }

    this.closeConnections();
    return result;
  }

  /**
   * Invoked anytime a {@link net.Socket} client connects to this server.
   * Handles the client's signup process.
   */
  private clientConnectionCallback(client: net.Socket): void {
    if (this.currentPhase !== Phase.REGISTRATION) {
      client.destroy();
      return;
    }

    this.handleClientSignup(client);
  }

  /**
   * Handles signing a client up. Expects a string representing the player's name
   * from the {@link client} in no more than {@link MAX_NAME_WAITING_LENGTH_MS}.
   * If invalid name is given, will close connection with {@link client}.
   */
  private async handleClientSignup(client: net.Socket): Promise<void> {
    const assembler = createJsonAssembler(client);

    const acceptName = () => {
      return new Promise<void>((resolve) => {
        handleNextSerializedDataValue(assembler, (data: unknown) => {
          this.acceptClientSignup(client, data)
            .then(() => resolve())
            .catch(() => client.destroy());
        })
      })
    }

    executeMethodOrTimeout<void>(acceptName, MAX_NAME_WAITING_LENGTH_MS).catch(() => client.end());
  }

  /**
   * Checks if the given {@link data} is a valid player name and adds this client
   * to the list of clients if there are fewer than {@link MAX_PLAYERS} players.
   * @throws if {@link data} is an invalid name or if there is no space for another player.
   */
  private async acceptClientSignup(client: net.Socket, data: unknown): Promise<void> {
    const isValidName = isString(data) && BasicPlayer.isValidName(data);
    const isSpaceLeft = this.clients.length < MAX_PLAYERS;

    if (isValidName) {
      if (isSpaceLeft) {
        this.clients.unshift([client, data]);
      } else {
        throw 'Could not register player - no space left';
      }
    } else {
      throw `Could not register player - invalid name ${data} given`;
    }
  }

  /**
   * Allows for clients to register to the game within the allowed registration periods.
   * Changes the phase of the game to {@link Phase.GAME} once all registration periods
   * have expired or {@link MAX_PLAYERS} clients have registered.
   */
  private async handleClientRegistration(): Promise<void> {
    let registrationPeriod = 0;

    while (registrationPeriod < MAX_REGISTRATION_PERIODS && this.clients.length < MIN_PLAYERS) {
      registrationPeriod += 1;

      await executeMethodOrTimeout(
        this.resolveWhenReachedMaxCapacity,
        REGISTRATION_PERIOD_LENGTH_MS
      );
    }
    this.currentPhase = Phase.GAME;
  }

  /**
   * Returns a promise that resolves when the length of clients reached max capacity.
   */
  private resolveWhenReachedMaxCapacity(): Promise<void> {
    return new Promise<void>((resolve) => {
      // eslint-disable-next-line no-empty
      while (this.clients.length !== MAX_PLAYERS) { }
      resolve();
    });
  }

  /**
   * Given a {@link GameState}, runs a game to completion and returns the results.
   */
  private async runGame(gameState: GameState): Promise<NamesResult> {
    const players = this.initializeProxyPlayers();
    const referee = new BasicReferee(gameState.getBoard().size);

    const result = await referee.runGame(players, gameState);
    const winners = result.winners.toArray().map(player => player.name());
    const kicked = result.removed.toArray().map(player => player.name());

    return [winners, kicked];
  }

  /**
   * Creates proxy players from the remote client sockets
   */
  private initializeProxyPlayers(): Player[] {
    return this.clients.map(([clientSocket, name]) => {
      return new StreamPlayer(clientSocket, clientSocket, name);
    });
  }

  /**
   * Closes connection to all client sockets.
   */
  private closeConnections(): void {
    for (const [client] of this.clients) {
      client.destroy();
    }
  }
}
