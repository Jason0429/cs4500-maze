import { Action } from '../Common/Action';
import { Board } from '../Common/Board/Board';
import { ErrorCode, LabyrinthError } from '../Common/LabyrinthError';
import { Player } from '../Players/Player';
import { PublicGameState } from '../Common/State/PublicGameState';
import { serializeCoordinate } from '../Serialize/Board';
import { deserializeChoiceResult, deserializeVoidResult, } from '../Serialize/NetworkMessages';
import { serializePublicGameState } from '../Serialize/PublicGameState';
import { createJsonAssembler, handleNextSerializedDataValue, serializeAndSendToStream, } from '../Utility/Serialize';
import Asm from 'stream-json/Assembler';
import { Writable } from 'node:stream';
import { Readable } from 'stream';
import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';

/**
 * Represents a proxy implementation of a player using input and output streams.
 */
export class StreamPlayer implements Player {
  private readonly assembler: Asm;
  private readonly inputStream: Readable;
  private readonly outputStream: Writable;
  private readonly playerName: string;

  public constructor(
    inputStream: Readable,
    outputStream: Writable,
    playerName: string
  ) {
    this.inputStream = inputStream;
    this.outputStream = outputStream;
    this.assembler = createJsonAssembler(this.inputStream);
    this.playerName = playerName;
  }

  public name(): string {
    this.ensureBothStreamsOn();
    return this.playerName;
  }

  public async proposeBoard0(_size: GridSize): Promise<Board> {
    this.ensureBothStreamsOn();
    throw 'proposeBoard0 not supported yet.';
  }

  public async setup(goal: Coordinate, stateInfo?: PublicGameState): Promise<void> {
    this.ensureBothStreamsOn();
    await this.sendAndReceive<void>(
      SETUP_MNAME,
      [
        stateInfo === undefined ? false : serializePublicGameState(stateInfo),
        serializeCoordinate(goal),
      ],
      deserializeVoidResult
    );
  }

  public async takeTurn(stateInfo: PublicGameState): Promise<Action> {
    this.ensureBothStreamsOn();
    return await this.sendAndReceive<Action>(
      TAKE_TURN_MNAME,
      [serializePublicGameState(stateInfo)],
      deserializeChoiceResult
    );
  }

  public async win(w: boolean): Promise<void> {
    this.ensureBothStreamsOn();
    await this.sendAndReceive<void>(WIN_MNAME, [w], deserializeVoidResult);
  }

  /**
   * Serializes the {@link methodName} and {@link args} and sends it to {@link outputStream}.
   * Receives and returns the deserialized result.
   * Arguments should be checked for validity before invoking this function.
   */
  private async sendAndReceive<T>(
    methodName: MName,
    args: unknown[],
    deserializeMethod: (data: unknown) => T
  ): Promise<T> {
    serializeAndSendToStream(this.outputStream, [methodName, args]);
    return await handleNextSerializedDataValue(this.assembler, deserializeMethod);
  }

  /**
   * Throws an error if either the {@link inputStream} and/or {@link outputStream} is closed.
   */
  private ensureBothStreamsOn() {
    if (this.inputStream.closed || this.outputStream.closed) {
      throw new LabyrinthError({
        message: 'One or both input-output streams were closed.',
        code: ErrorCode.STREAM_CLOSED
      })
    }
  }
}

export const SETUP_MNAME = 'setup' as const;
export const TAKE_TURN_MNAME = 'take-turn' as const;
export const WIN_MNAME = 'win' as const;
export type MName = typeof SETUP_MNAME | typeof TAKE_TURN_MNAME | typeof WIN_MNAME;

