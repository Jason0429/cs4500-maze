import makeParser from 'stream-json';
import Asm from 'stream-json/Assembler';
import { Readable, Writable } from 'stream';

/**
 * Given some data, convert it to JSON (rather than the Javascript object-based representation
 * of JSON) and send it to a {@link Writable} stream.
 */
export function serializeAndSendToStream(outputStream: Writable, data: unknown): void {
  const serializedData = JSON.stringify(data);
  outputStream.write(serializedData);
}

/**
 * For EACH unit of data (depends on the serialization method - for JSON, this is one
 * JSON value) received from the given {@link Parser}, call a handler function.
 */
export async function handleEachSerializedDataValue(
  jsonValueAssembler: Asm,
  handler: (data: unknown) => void
): Promise<void> {
  jsonValueAssembler.on('done', (asm: Asm) => handler(asm.current));
}

/**
 * For a SINGLE unit of data (ie - a JSON value), run a handler once.
 * This function should be used in a blocking manner, allowing us to pause until a single
 * value has been accepted from the {@link jsonValueAssembler}.
 */
export async function handleNextSerializedDataValue<T>(
  jsonValueAssembler: Asm,
  handler: (data: unknown) => T
): Promise<T> {
  return new Promise<T>((resolve, _reject) => {
    jsonValueAssembler.once('done', (asm: Asm) => {
      const result = handler(asm.current);
      resolve(result);
    });
  });
}

/**
 * Given a {@link Readable} stream, wraps it in a JSON parser compatible with
 * JSON streaming.
 */
export function createJsonAssembler(stream: Readable): Asm {
  const parser = stream.pipe(makeParser({ jsonStreaming: true }));
  return Asm.connectTo(parser);
}
