/**
 * The Tile module is composed of interface and type definitions that relate
 * to the tile component of the game Labyrinth. This is a major component of the {@link Board}.
 *
 * @module Tile
 */
import {NumUtil} from '../../Utility/Number';
import {
  Direction,
  HorizontalDirection,
  oppositeDirection,
  VerticalDirection,
} from '../Direction';
import {GemPair} from './Gem';
import {ErrorCode, LabyrinthError} from '../LabyrinthError';
import {Map as ImmutableMap} from 'immutable';
import {Connector, CONNECTORS} from './Connector';
import {Random} from '../../Utility/Random';

/**
 * Represents a tile in the game of Labyrinth which is composed of {@link ConnectorDirections} and {@link Gem.GemPair} .
 */
export interface Tile {
  /**
   * Checks if the current tile {@link Tile} can connect in the given {@link Direction}.
   *
   * @param direction - {@link Direction} to check in
   */
  canConnectInDirection: (direction: Direction) => boolean;

  /**
   * Checks if the current tile {@link Tile} can connect with the given {@link Tile} if they are placed
   * next each other in the given {@link Direction}.
   *
   * @param otherTile - {@link Tile} to check with the current {@link Tile}
   * @param direction - {@link Direction} to check in
   */
  canConnectToTile: (otherTile: Tile, direction: Direction) => boolean;

  /**
   * Rotates this {@link Tile} 90 degrees counterclockwise the given number of times.
   * For example, 5 rotations would equate to 450-degree rotation (which is the same as 90 degrees).
   *
   * @param rotations - number of rotations to apply to this tile
   */
  rotate: (rotations: number) => Tile;

  /**
   * Compares if the other {@link Tile} is equivalent to the current {@link Tile}.
   * Two {@link Tile}s are equivalent if they have the same {@link ConnectorDirections} and {@link GemPair}.
   *
   * @param other - {@link Tile} to be compared with
   */
  equals: (other: Tile) => boolean;

  /**
   * Represents the treasure of the current {@link Tile}, which is a {@link Gem.GemPair}.
   */
  readonly treasure: GemPair;

  /**
   * Represents the {@link Connector} of the current {@link Tile}.
   */
  connector: Connector;
}

/**
 * A basic implementation of a {@link Tile} in the game Labyrinth.
 */
export class BasicTile implements Tile {
  public readonly treasure: GemPair;
  protected readonly directions: ConnectorDirections;

  constructor(connector: Connector, treasure: GemPair) {
    this.directions = ConnectorDirections.fromConnector(connector);
    this.treasure = treasure;
  }

  public rotate(rotations: number): Tile {
    if (!NumUtil.isInteger(rotations)) {
      throw new LabyrinthError({
        message: `Invalid value for tile rotation: ${rotations}.`,
        code: ErrorCode.INVALID_TILE_ROTATIONS,
      });
    }

    return new BasicTile(
      this.directions.rotate(rotations).toConnector(),
      this.treasure
    );
  }

  public canConnectInDirection(direction: Direction): boolean {
    return this.directions.canConnectInDirection(direction);
  }

  public canConnectToTile(otherTile: Tile, direction: Direction): boolean {
    return (
      this.canConnectInDirection(direction) &&
      otherTile.canConnectInDirection(oppositeDirection(direction))
    );
  }

  public equals(other: Tile): boolean {
    return (
      this.connector === other.connector && this.treasure.equals(other.treasure)
    );
  }

  public get connector(): Connector {
    return this.directions.toConnector();
  }
}

/**
 * A mutable data type that represents directions in which a {@link Tile} connects to.
 */
class ConnectorDirections {
  /**
   * Represents the directions in which a {@link Tile} can connect.
   * The 4-element array represents the LEFT, TOP, RIGHT, and BOTTOM in that order.
   */
  private connections: [boolean, boolean, boolean, boolean];

  constructor(params: {
    left?: boolean;
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
  }) {
    this.connections = [
      params.left ?? false,
      params.top ?? false,
      params.right ?? false,
      params.bottom ?? false,
    ];
  }

  static fromConnector(connector: Connector): ConnectorDirections {
    const directions = CONNECTORS_TO_DIRECTIONS.get(connector);

    if (directions === undefined) {
      throw new Error(`${connector} has no ConnectorDirections representation`);
    }

    return directions;
  }

  toConnector(): Connector {
    const connector = DIRECTIONS_TO_CONNECTOR.get(this);

    if (connector === undefined) {
      throw new Error(`${this} has no Connector representation`);
    }

    return connector;
  }

  canConnectInDirection(direction: Direction): boolean {
    switch (direction) {
      case HorizontalDirection.LEFT:
        return this.left;
      case HorizontalDirection.RIGHT:
        return this.right;
      case VerticalDirection.UP:
        return this.top;
      case VerticalDirection.DOWN:
        return this.bottom;
    }
  }

  get left(): boolean {
    return this.connections[0];
  }

  get top(): boolean {
    return this.connections[1];
  }

  get right(): boolean {
    return this.connections[2];
  }

  get bottom(): boolean {
    return this.connections[3];
  }

  /**
   * Returns a new ConnectorDirections after rotation 90 degrees counterclockwise the given number of times
   */
  rotate(rotations: number): ConnectorDirections {
    const newConnections = [...this.connections];

    this.connections.forEach((_, i) => {
      // Change the index of each direction by the specified number of
      // rotations, wrapping around every 360 degrees (4 rotations)
      newConnections[NumUtil.mod(i - rotations, 4)] = this.connections[i];
    });

    return new ConnectorDirections({
      left: newConnections[0],
      top: newConnections[1],
      right: newConnections[2],
      bottom: newConnections[3],
    });
  }

  equals(other: ConnectorDirections): boolean {
    return (
      this.left === other.left &&
      this.top === other.top &&
      this.right === other.right &&
      this.bottom === other.bottom
    );
  }

  hashCode(): number {
    /**
     * This is a simple hashCode implementation: a ConnectorDirections can be represented
     * as a 4-bit binary number, each bit representing one direction (the order doesn't matter,
     * so long as it is consistent). For each bit, 1 indicates `true`, 0 indicates `false`
     */
    let hash = 0;
    for (const connection of this.connections) {
      hash = (hash << 1) + (connection ? 1 : 0);
    }
    return hash;
  }
}

/**
 * This is the source of truth for mapping a Connector to its corresponding
 * ConnectorDirections.
 */
const CONNECTORS_AND_DIRECTIONS: [Connector, ConnectorDirections][] = [
  ['│', new ConnectorDirections({top: true, bottom: true})],
  ['─', new ConnectorDirections({left: true, right: true})],
  ['┐', new ConnectorDirections({left: true, bottom: true})],
  ['└', new ConnectorDirections({top: true, right: true})],
  ['┌', new ConnectorDirections({right: true, bottom: true})],
  ['┘', new ConnectorDirections({top: true, left: true})],
  ['┬', new ConnectorDirections({left: true, right: true, bottom: true})],
  ['├', new ConnectorDirections({top: true, bottom: true, right: true})],
  ['┴', new ConnectorDirections({top: true, left: true, right: true})],
  ['┤', new ConnectorDirections({left: true, top: true, bottom: true})],
  [
    '┼',
    new ConnectorDirections({left: true, top: true, right: true, bottom: true}),
  ],
];

/**
 * These two maps are used internally for bidirectional mapping of Connectors
 * and ConnectorDirections
 */
const CONNECTORS_TO_DIRECTIONS = ImmutableMap(CONNECTORS_AND_DIRECTIONS);
const DIRECTIONS_TO_CONNECTOR = ImmutableMap(
  CONNECTORS_AND_DIRECTIONS.map(item => [item[1], item[0]])
);

export type TileMap = ImmutableMap<Connector, Tile>;
/**
 * @deprecated Try to move away from using Random in testing.
 */
export function getTileMap(gemPair?: GemPair, rawRandom?: Random): TileMap {
  const random = rawRandom ?? new Random();

  return ImmutableMap<Connector, Tile>(
    CONNECTORS.map(connector => [
      connector,
      new BasicTile(connector, gemPair || random.gemPair()),
    ])
  );
}
