import { Coordinate } from '../../../Common/Board/Coordinate';
import {BasicPlayer} from '../../../Players/Player';
import {createStrategy, StrategyType} from '../../../Players/Strategy';
import {BasicDispatcher, Dispatcher} from '../../../Remote/Referee';
import {JsonCoordinate} from '../../../Serialize/Board';

describe('Dispatcher callMethod', () => {
  let player: BasicPlayer;
  let dispatcher: Dispatcher;

  beforeEach(() => {
    player = new BasicPlayer('player', createStrategy(StrategyType.EUCLID));
    dispatcher = new BasicDispatcher(player);
  });

  test('malformed data', async () => {
    await expect(() =>
      dispatcher.callPlayerMethod({a: ['testing', []]})
    ).rejects.toThrow(/Invalid method call/);
    await expect(() => dispatcher.callPlayerMethod(undefined)).rejects.toThrow(
      /Invalid method call/
    );
    await expect(() => dispatcher.callPlayerMethod('won')).rejects.toThrow(
      /Invalid method call/
    );
    await expect(() => dispatcher.callPlayerMethod(false)).rejects.toThrow(
      /Invalid method call/
    );
    await expect(() => dispatcher.callPlayerMethod(player)).rejects.toThrow(
      /Invalid method call/
    );
    await expect(() =>
      dispatcher.callPlayerMethod(['won', 'two', 'three'])
    ).rejects.toThrow(/Invalid method call/);
  });

  test('nonexistent method names', async () => {
    await expect(() =>
      dispatcher.callPlayerMethod(['testing', []])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['won', []])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['takeTurn', []])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['situp', []])
    ).rejects.toThrow(/Invalid method call/);
  });

  test('arguments array does not exist', async () => {
    await expect(() =>
      dispatcher.callPlayerMethod(['won', {}])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['won', 'string'])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['won', true])
    ).rejects.toThrow(/Invalid method call/);
    await expect(() =>
      dispatcher.callPlayerMethod(['won', undefined])
    ).rejects.toThrow(/Invalid method call/);
  });

  describe('setup', () => {
    test('calling setup with invalid arguments', async () => {
      await expect(() =>
        dispatcher.callPlayerMethod(['setup', []])
      ).rejects.toThrow(/'setup' called with wrong number of arguments/);
      await expect(() =>
        dispatcher.callPlayerMethod(['setup', [undefined, undefined]])
      ).rejects.toThrow(/Invalid 'setup' call/);
      await expect(() =>
        dispatcher.callPlayerMethod([
          'setup',
          [undefined, {'row#': 1, 'column#': 1} as JsonCoordinate],
        ])
      ).rejects.toThrow(/Invalid 'setup' call/);
      await expect(() =>
        dispatcher.callPlayerMethod([
          'setup',
          [true, {'row#': 1, 'column#': 1} as JsonCoordinate],
        ])
      ).rejects.toThrow(/Invalid 'setup' call/);
      await expect(() =>
        dispatcher.callPlayerMethod([
          'setup',
          [undefined, {'row#': 1, 'column#': 1} as JsonCoordinate],
        ])
      ).rejects.toThrow(/Invalid 'setup' call/);
      await expect(() =>
        dispatcher.callPlayerMethod([
          'setup',
          [
            false,
            {'row#': 1, 'column#': 1} as JsonCoordinate,
            'third argument',
          ],
        ])
      ).rejects.toThrow(/'setup' called with wrong number of arguments/);
      await expect(() =>
        dispatcher.callPlayerMethod([
          'setup',
          [
            STATE,
            {'row#': 1, 'column#': 1} as JsonCoordinate,
            'third argument',
          ],
        ])
      ).rejects.toThrow(/'setup' called with wrong number of arguments/);
    });

    test('setup with valid arguments', async () => {
      jest.spyOn(player, 'setup');

      expect(await dispatcher.callPlayerMethod([
        'setup',
        [STATE, {'row#': 1, 'column#': 1} as JsonCoordinate],
      ])).toBe('void')
      expect(player.setup).toHaveBeenCalledTimes(1);
      expect(player['goal']).toEqual(new Coordinate({row: 1, column: 1}));

      expect(await dispatcher.callPlayerMethod([
        'setup',
        [false, {'row#': 3, 'column#': 1} as JsonCoordinate],
      ])).toBe('void');
      expect(player.setup).toHaveBeenCalledTimes(2);
      expect(player['goal']).toEqual(new Coordinate({row: 3, column: 1}));
    });
  });

  describe('takeTurn', () => {
    test('with invalid arguments', async () => {
      await expect(() =>
        dispatcher.callPlayerMethod(['take-turn', [STATE, STATE]])
      ).rejects.toThrow(/'take-turn' called with wrong number of arguments/);
      await expect(() =>
        dispatcher.callPlayerMethod(['take-turn', [undefined]])
      ).rejects.toThrow(/not an object/);
      await expect(() =>
        dispatcher.callPlayerMethod(['take-turn', ['this is a state']])
      ).rejects.toThrow(/not an object/);
      await expect(() =>
        dispatcher.callPlayerMethod(['take-turn', [undefined, STATE]])
      ).rejects.toThrow(/'take-turn' called with wrong number of arguments/);
      await expect(() =>
        dispatcher.callPlayerMethod(['take-turn', [{...STATE, last: 'apple'}]])
      ).rejects.toThrow(/not a valid Action/);
    });

    test('valid arguments', async () => {
      await dispatcher.callPlayerMethod([
        'setup',
        [STATE, {'row#': 7, 'column#': 5} as JsonCoordinate],
      ]);

      expect(await dispatcher.callPlayerMethod(['take-turn', [STATE]])).toEqual(
        [0, 'LEFT', 0, {'row#': 7, 'column#': 5}]
      );

      await dispatcher.callPlayerMethod([
        'setup',
        [false, {'row#': 1, 'column#': 1} as JsonCoordinate],
      ]);

      expect(
        await dispatcher.callPlayerMethod([
          'take-turn',
          [STATE_WITH_GOAL({'row#': 1, 'column#': 1})],
        ])
      ).toEqual([0, 'LEFT', 0, {'row#': 0, 'column#': 1}]);
    });
  });

  describe('win', () => {
    test('with invalid arguments', async () => {
      await expect(() =>
        dispatcher.callPlayerMethod(['win', []])
      ).rejects.toThrow(/Invalid arguments for 'win'/);
      await expect(() =>
        dispatcher.callPlayerMethod(['win', [false, false]])
      ).rejects.toThrow(/Invalid arguments for 'win'/);
      await expect(() =>
        dispatcher.callPlayerMethod(['win', ['true', false]])
      ).rejects.toThrow(/Invalid arguments for 'win'/);

      await expect(() =>
        dispatcher.callPlayerMethod(['win', ['true']])
      ).rejects.toThrow(/Invalid arguments for 'win'/);
      await expect(() =>
        dispatcher.callPlayerMethod(['win', [{}]])
      ).rejects.toThrow(/Invalid arguments for 'win'/);
      await expect(() =>
        dispatcher.callPlayerMethod(['win', [1]])
      ).rejects.toThrow(/Invalid arguments for 'win'/);
      await expect(() =>
        dispatcher.callPlayerMethod(['win', [0]])
      ).rejects.toThrow(/Invalid arguments for 'win'/);

    })

    test('with valid arguments', async () => {
      jest.spyOn(player, 'win');
      expect(await dispatcher.callPlayerMethod(['win', [true]])).toBe('void');
      expect(player.win).toHaveBeenLastCalledWith(true);

      expect(await dispatcher.callPlayerMethod(['win', [false]])).toBe('void');
      expect(player.win).toHaveBeenLastCalledWith(false);
    })
  })
});

export const STATE = {
  board: {
    connectors: [
      ['│', '┼', '┐', '└', '┌', '┘', '┬'],
      ['│', '┼', '┼', '┼', '┼', '┼', '┬'],
      ['└', '┼', '┼', '┼', '┼', '┼', '┼'],
      ['│', '┼', '┼', '┼', '┼', '┼', '┬'],
      ['│', '┼', '┼', '┼', '┼', '┼', '┬'],
      ['│', '─', '┼', '└', '┼', '┼', '┬'],
      ['│', '─', '┐', '│', '┼', '┼', '┬'],
      ['│', '─', '┐', '│', '┼', '┘', '┬'],
    ],
    treasures: [
      [
        ['rose-quartz', 'yellow-heart'],
        ['pink-emerald-cut', 'mexican-opal'],
        ['green-aventurine', 'ruby-diamond-profile'],
        ['rose-quartz', 'labradorite'],
        ['color-change-oval', 'star-cabochon'],
        ['green-princess-cut', 'dumortierite'],
        ['diamond', 'chrome-diopside'],
      ],
      [
        ['raw-citrine', 'clinohumite'],
        ['ammolite', 'hematite'],
        ['jasper', 'sphalerite'],
        ['super-seven', 'green-beryl'],
        ['green-beryl-antique', 'aventurine'],
        ['diamond', 'moonstone'],
        ['unakite', 'dumortierite'],
      ],
      [
        ['tanzanite-trillion', 'kunzite'],
        ['chrysoberyl-cushion', 'goldstone'],
        ['kunzite', 'goldstone'],
        ['garnet', 'jasper'],
        ['australian-marquise', 'sphalerite'],
        ['green-beryl-antique', 'black-onyx'],
        ['ruby-diamond-profile', 'pink-round'],
      ],
      [
        ['apricot-square-radiant', 'zircon'],
        ['cordierite', 'bulls-eye'],
        ['jaspilite', 'padparadscha-oval'],
        ['rose-quartz', 'dumortierite'],
        ['prehnite', 'pink-spinel-cushion'],
        ['purple-square-cushion', 'carnelian'],
        ['black-spinel-cushion', 'zoisite'],
      ],
      [
        ['green-aventurine', 'chrome-diopside'],
        ['citrine', 'black-spinel-cushion'],
        ['chrysoberyl-cushion', 'moss-agate'],
        ['heliotrope', 'blue-ceylon-sapphire'],
        ['tourmaline', 'lapis-lazuli'],
        ['green-princess-cut', 'gray-agate'],
        ['almandine-garnet', 'citrine-checkerboard'],
      ],
      [
        ['moonstone', 'chrysolite'],
        ['ametrine', 'yellow-beryl-oval'],
        ['prasiolite', 'green-aventurine'],
        ['lapis-lazuli', 'blue-spinel-heart'],
        ['pink-round', 'beryl'],
        ['red-diamond', 'red-diamond'],
        ['citrine-checkerboard', 'grandidierite'],
      ],
      [
        ['kunzite', 'grossular-garnet'],
        ['red-spinel-square-emerald-cut', 'red-spinel-square-emerald-cut'],
        ['aplite', 'beryl'],
        ['green-aventurine', 'alexandrite-pear-shape'],
        ['zoisite', 'blue-cushion'],
        ['diamond', 'ametrine'],
        ['australian-marquise', 'iolite-emerald-cut'],
      ],
      [
        ['kunzite', 'jasper'],
        ['red-spinel-square-emerald-cut', 'jasper'],
        ['aplite', 'jasper'],
        ['green-aventurine', 'jasper'],
        ['zoisite', 'jasper'],
        ['diamond', 'jasper'],
        ['australian-marquise', 'jasper'],
      ],
    ],
  },
  spare: {
    tilekey: '│',
    '1-image': 'cordierite',
    '2-image': 'green-aventurine',
  },
  plmt: [
    {
      current: {'row#': 1, 'column#': 1},
      home: {'row#': 1, 'column#': 1},
      goto: {'row#': 7, 'column#': 5},
      color: 'red',
    },
    {
      current: {'row#': 1, 'column#': 1},
      home: {'row#': 1, 'column#': 3},
      goto: {'row#': 7, 'column#': 5},
      color: 'green',
    },
    {
      current: {'row#': 1, 'column#': 1},
      home: {'row#': 1, 'column#': 5},
      goto: {'row#': 7, 'column#': 5},
      color: 'blue',
    },
  ],
  last: null,
};

const STATE_WITH_GOAL = (goal: JsonCoordinate) => ({
  ...STATE,
  plmt: [{...STATE.plmt[0], goto: goal}, ...STATE.plmt.slice(1)],
});
