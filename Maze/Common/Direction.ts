import { List } from 'immutable';

/**
 * Represents a direction in the horizontal axis.
 */
export enum HorizontalDirection {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

export const HorizontalDirections = List<Direction>([HorizontalDirection.LEFT, HorizontalDirection.RIGHT]);

/**
 * Represents a direction in the vertical axis.
 */
export enum VerticalDirection {
    UP = 'UP',
    DOWN = 'DOWN'
}

export const VerticalDirections = List<Direction>([VerticalDirection.UP, VerticalDirection.DOWN]);

/**
 * Represents in a direction in the vertical or horizontal axis.
 */
export type Direction = HorizontalDirection | VerticalDirection;

export const Directions = HorizontalDirections.concat(VerticalDirections);

export function oppositeDirection(direction: Direction): Direction {
    switch (direction) {
        case HorizontalDirection.LEFT:
            return HorizontalDirection.RIGHT;
        case HorizontalDirection.RIGHT:
            return HorizontalDirection.LEFT;
        case VerticalDirection.UP:
            return VerticalDirection.DOWN;
        case VerticalDirection.DOWN:
            return VerticalDirection.UP;
    }
}
