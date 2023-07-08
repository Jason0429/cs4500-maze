import {BasicTile, Tile} from '../../Common/Tile/Tile';
import {Direction, HorizontalDirection, VerticalDirection} from '../../Common/Direction';
import {
  TILE_UP_DOWN,
  TILE_RIGHT_DOWN,
  TILE_UP_RIGHT_DOWN,
  TILE_LEFT_UP_RIGHT,
  TILE_ALL,
  TILE_LEFT_DOWN,
  TILE_LEFT_RIGHT,
  TILE_LEFT_DOWN_RIGHT,
  TILE_UP_RIGHT,
  TILE_LEFT_UP,
  TILE_DOWN_LEFT_UP,
} from './Tiles';
import {GEM_PAIR_MOONSTONE} from './GemPairs';
import {LabyrinthError, ErrorCode} from '../../Common/LabyrinthError';
import { Connector } from '../../Common/Tile/Connector';

/**
 * A helper function to determine if two tiles are equal (optionally ignoring the
 * treasure found on the tile).
 */
export function assertTileEqual(tile: Tile, otherTile: Tile, ignoreTreasure = false): void {
  otherTile = new BasicTile(
    otherTile.connector,
    ignoreTreasure ? tile.treasure : otherTile.treasure
  );

  expect(tile).toEqual(otherTile);
}

test('assertTileEqual and .equals()', () => {
  const tiles = [
    TILE_UP_DOWN,
    TILE_RIGHT_DOWN,
    TILE_UP_RIGHT_DOWN,
    TILE_LEFT_UP_RIGHT,
    TILE_ALL,
    TILE_LEFT_DOWN,
    TILE_UP_RIGHT,
    TILE_LEFT_RIGHT,
    TILE_LEFT_DOWN_RIGHT,
    TILE_LEFT_UP,
  ];

  for (const tile of tiles) {
    assertTileEqual(tile, tile, true);
    assertTileEqual(tile, tile, false);
    assertTileEqual(tile, new BasicTile(tile.connector, GEM_PAIR_MOONSTONE), true);
    expect(tile).toBe(tile);
    expect(tile.equals(tile)).toBeTruthy();
    expect(tile.equals(new BasicTile(tile.connector, GEM_PAIR_MOONSTONE))).toBeFalsy();
  }
});

describe('Testing BasicTile.canConnectInDirection().', () => {
  test('Two directions', () => {
    expect(TILE_UP_DOWN.canConnectInDirection(VerticalDirection.UP)).toBeTruthy();
    expect(TILE_UP_DOWN.canConnectInDirection(VerticalDirection.DOWN)).toBeTruthy();
    expect(TILE_UP_DOWN.canConnectInDirection(HorizontalDirection.LEFT)).toBeFalsy();
    expect(TILE_UP_DOWN.canConnectInDirection(HorizontalDirection.RIGHT)).toBeFalsy();
  })

  test('Three directions', () => {
    expect(TILE_DOWN_LEFT_UP.canConnectInDirection(VerticalDirection.UP)).toBeTruthy();
    expect(TILE_DOWN_LEFT_UP.canConnectInDirection(VerticalDirection.DOWN)).toBeTruthy();
    expect(TILE_DOWN_LEFT_UP.canConnectInDirection(HorizontalDirection.LEFT)).toBeTruthy();
    expect(TILE_DOWN_LEFT_UP.canConnectInDirection(HorizontalDirection.RIGHT)).toBeFalsy();
  })

  test('All directions', () => {
    expect(TILE_ALL.canConnectInDirection(VerticalDirection.UP)).toBeTruthy();
    expect(TILE_ALL.canConnectInDirection(VerticalDirection.DOWN)).toBeTruthy();
    expect(TILE_ALL.canConnectInDirection(HorizontalDirection.LEFT)).toBeTruthy();
    expect(TILE_ALL.canConnectInDirection(HorizontalDirection.RIGHT)).toBeTruthy();
  })
});

describe('Testing BasicTile.canConnect().', () => {
  const tileTests: [Tile, Direction, Tile, boolean][] = [
    [TILE_UP_DOWN, VerticalDirection.UP, TILE_RIGHT_DOWN, true],
    [TILE_UP_RIGHT_DOWN, VerticalDirection.DOWN, TILE_LEFT_UP_RIGHT, true],
    [TILE_ALL, HorizontalDirection.LEFT, TILE_ALL, true],
    [TILE_RIGHT_DOWN, HorizontalDirection.RIGHT, TILE_LEFT_RIGHT, true],
    [TILE_LEFT_DOWN_RIGHT, VerticalDirection.UP, TILE_UP_DOWN, false],
    [TILE_LEFT_DOWN_RIGHT, VerticalDirection.DOWN, TILE_RIGHT_DOWN, false],
    [TILE_UP_DOWN, HorizontalDirection.LEFT, TILE_ALL, false],
    [TILE_UP_RIGHT, HorizontalDirection.RIGHT, TILE_UP_DOWN, false],
  ];

  tileTests.forEach(tileTest => {
    test(`${tileTest[1]} connection returns ${tileTest[3]}`, () => {
      expect(tileTest[0].canConnectToTile(tileTest[2], tileTest[1])).toBe(tileTest[3]);
    });
  });
});

describe('Testing BasicTile.rotate().', () => {
  const rotateTests: Tile[][] = [
    [TILE_UP_DOWN, TILE_LEFT_RIGHT, TILE_UP_DOWN, TILE_LEFT_RIGHT],
    [TILE_RIGHT_DOWN, TILE_UP_RIGHT, TILE_LEFT_UP, TILE_LEFT_DOWN],
    [TILE_UP_RIGHT_DOWN, TILE_LEFT_UP_RIGHT, TILE_DOWN_LEFT_UP, TILE_LEFT_DOWN_RIGHT],
    [TILE_ALL, TILE_ALL, TILE_ALL, TILE_ALL],
  ];

  test('non-integer rotations throw errors', () => {
    const badValues = [0.1, 3.5, 1.5, -4.2];

    for (const value of badValues) {
      expect(() => TILE_ALL.rotate(value)).toThrow(
        new LabyrinthError({
          message: `Invalid value for tile rotation: ${value}.`,
          code: ErrorCode.INVALID_TILE_ROTATIONS,
        })
      );
    }
  });

  rotateTests.forEach(rotateTest => {
    for (let i = 0; i < 5; i++) {
      test(`tile '${rotateTest[0].connector}' rotates ${i} times correctly`, () => {
        const rotated = rotateTest[0].rotate(i);
        expect(rotated).toEqual(rotateTest[i % rotateTest.length]);
        expect(rotated).toEqual(rotateTest[0].rotate(i + 4));
        expect(rotated).toEqual(rotateTest[0].rotate(i - 4));
      });
    }
  });
});

test('constructing with invalid Connector input', () => {
  expect(() => new BasicTile('x' as Connector, GEM_PAIR_MOONSTONE)).toThrow(/no ConnectorDirections representation/i);
  expect(() => new BasicTile(undefined as unknown as Connector, GEM_PAIR_MOONSTONE)).toThrow(/no ConnectorDirections representation/i);
  expect(() => new BasicTile(null as unknown as Connector, GEM_PAIR_MOONSTONE)).toThrow(/no ConnectorDirections representation/i);
})
