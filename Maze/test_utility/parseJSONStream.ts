import { JSONParser } from '@streamparser/json';
import { Readable } from 'stream';

/**
 * Reads a UTF-8 stream as a series of JSON and
 * returns the serialized result when the stream ends.
 */
export function parseJSONStream(stream: Readable): Promise<unknown[]> {
    const parser = new JSONParser({
        separator: '',
        paths: ['$']
    });
    stream.on('data', data => parser.write(data));
    stream.on('end', () => { parser.end() });

    return new Promise<unknown[]>((resolve, reject) => {
        const data: unknown[] = [];
        parser.onValue = value => {
            data.push(value);
        }
        parser.onEnd = () => resolve(data);
        parser.onError = err => reject(err);
    });
}
