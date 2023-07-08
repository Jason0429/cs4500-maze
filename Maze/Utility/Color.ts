import {Record} from 'immutable';
import {ErrorCode, LabyrinthError} from '../Common/LabyrinthError';
import { PublicPlayerState } from '../Common/PublicPlayerState';

/**
 * An immutable data type to represent a color for a player's {@link PublicPlayerState}.
 */
export class Color extends Record({color: ''}) {
    static readonly PREDEFINED_COLORS = [
        'purple',
        'orange',
        'pink',
        'red',
        'blue',
        'green',
        'yellow',
        'white',
        'black'
    ];

    /**
       * Constructs an immutable Color.
       *
       * @param color - an string that must specify one of the {@link PREDEFINED_COLORS} or a hex code.
       */
    constructor(color: string) {
        if (
            !Color.PREDEFINED_COLORS.includes(color) &&
            !isHex(color)
        ) {
            throw new LabyrinthError({
                message: `Invalid color '${color}' specified.`,
                code: ErrorCode.INVALID_COLOR
            });
        }

        super({color});
    }
}

export function isHex(color: string): boolean {
  return color.match(/^[A-F|\d][A-F|\d][A-F|\d][A-F|\d][A-F|\d][A-F|\d]$/) !== null;
}

export function generateRandomColor(): Color {
  return new Color((Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0').toUpperCase());
}
