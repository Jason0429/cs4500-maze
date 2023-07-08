import { Player } from '../Players/Player';
import { deserializeCoordinate } from '../Serialize/Board';
import { deserializeState } from '../Serialize/GameState';
import {
  isArray,
  isArrayOfLength,
  isBoolean,
  isString,
  JsonDeserializeError,
} from '../Serialize/utils';
import { MName, SETUP_MNAME, TAKE_TURN_MNAME, WIN_MNAME } from './Player';
import { serializeAction } from '../Serialize/Strategy';

/**
 * Dispatches method calls to a {@link Player}.
 */
export interface Dispatcher {
  /**
   * Expects a method call as an array in the form of:
   * - a valid method name
   * - an array of arguments which match those expected by that method
   * If the format is correct, this will call the corresponding function on the internal
   * {@link Player}, and return the serialized result.
   */
  callPlayerMethod(data: unknown): Promise<unknown>;
}

/**
 * A basic implementation of {@link Dispatcher} that handles
 * calling {@link Player} methods with deserialized data and
 * returns serialized responses.
 */
export class BasicDispatcher implements Dispatcher {
  private readonly player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /**
   * A type guard that checks if the given {@link data} is a valid {@link MName}.
   */
  private isMName(data: unknown): data is MName {
    return isString(data) && (data === 'setup' || data === 'take-turn' || data === 'win');
  }

  /**
   * Invokes a {@link Player}'s setup method and returns 'void' as the serialized result.
   * @throws {@link JsonDeserializeError} if invalid arguments were passed.
   */
  private async callSetup(data: unknown): Promise<unknown> {
    if (isArrayOfLength(data, 2)) {
      const goal = deserializeCoordinate(data[1]);

      if (isBoolean(data[0])) {
        if (data[0]) {
          throw new JsonDeserializeError("Got a 'true' boolean for a State");
        }
        await this.player.setup(goal);
      } else {
        const gameState = deserializeState(data[0]);
        await this.player.setup(goal, gameState.getPublicGameState());
      }

      return 'void';
    }
    throw new JsonDeserializeError("'setup' called with wrong number of arguments", data);
  }

  /**
   * Invokes a {@link Player}'s take turn method and returns the serialized result.
   * @throws {@link JsonDeserializeError} if invalid arguments were passed.
   */
  private async callTakeTurn(data: unknown): Promise<unknown> {
    if (isArrayOfLength(data, 1)) {
      const gameState = deserializeState(data[0]);
      return serializeAction(await this.player.takeTurn(gameState.getPublicGameState()));
    }
    throw new JsonDeserializeError("'take-turn' called with wrong number of arguments", data);
  }

  /**
   * Invokes a {@link Player}'s win method and returns 'void' as the serialized result.
   * @throws {@link JsonDeserializeError} if invalid arguments were passed.
   */
  private async callWin(data: unknown): Promise<unknown> {
    if (isArrayOfLength(data, 1) && isBoolean(data[0])) {
      await this.player.win(data[0]);
      return 'void';
    }
    throw new JsonDeserializeError("Invalid arguments for 'win'", data);
  }

  /**
   * Attempts to invoke and return the serialized value of {@link methodCall}.
   * @throws {@link JsonDeserializeError} if an invalid call was made (i.e. invalid arguments).
   */
  private async callMethodSafe(
    methodCall: () => Promise<unknown>,
    methodName: string
  ): Promise<unknown> {
    try {
      return await methodCall();
    } catch (e) {
      const msgToAppend = e instanceof Error ? e.message : '';
      throw new JsonDeserializeError(`Invalid '${methodName}' call on player: ${msgToAppend}`);
    }
  }

  async callPlayerMethod(data: unknown): Promise<unknown> {
    if (!isArrayOfLength(data, 2) || !this.isMName(data[0]) || !isArray(data[1])) {
      throw new JsonDeserializeError('Invalid method call on Player', data);
    }

    const methodName = data[0];
    const args = data[1];
    switch (methodName) {
      case SETUP_MNAME:
        return await this.callMethodSafe(async () => this.callSetup(args), SETUP_MNAME);
      case TAKE_TURN_MNAME:
        return await this.callMethodSafe(async () => this.callTakeTurn(args), TAKE_TURN_MNAME);
      case WIN_MNAME:
        return await this.callMethodSafe(async () => this.callWin(args), WIN_MNAME);
    }
  }
}
