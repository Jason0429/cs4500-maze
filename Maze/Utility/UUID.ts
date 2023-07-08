import {randomUUID} from 'crypto';
import {Record} from 'immutable';
import {ErrorCode, LabyrinthError} from '../Common/LabyrinthError';

/**
 * {@deprecated UUID is no longer used.}
 * An immutable data type to represent a unique ID.
 */
export class UUID extends Record({UUID: ''}) {
    private static readonly UUID_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    /**
     * Constructs an immutable grid size.
     *
     * @param UUID - a valid UUID string.
     */
    constructor(id?: string) {
        if(id !== undefined && !id.match(UUID.UUID_REGEX)) {
            throw new LabyrinthError({
                message: 'Invalid UUID format string',
                code: ErrorCode.INVALID_UUID_FORMAT
            });
        }
        super({UUID: id || randomUUID()});
    }
}
