import MemoryStream from 'memorystream';
import { Duplex } from 'stream';
import { initializeClient } from '../../../Client/Client';
import { BasicPlayer, Player } from '../../../Players/Player';
import { createStrategy, StrategyType } from '../../../Players/Strategy';
import { StreamPlayer } from '../../../Remote/Player';
import { STATE } from '../Client/Referee.test';
import { BasicPublicGameState } from '../../../Common/State/PublicGameState';
import { deserializeState, deserializeTile } from '../../../Serialize/GameState';
import { serializePublicGameState } from '../../../Serialize/PublicGameState';
import { Coordinate } from '../../../Common/Board/Coordinate';

describe('StreamPlayer I/O', () => {
  let proxyPlayerInputStream: Duplex;
  let proxyPlayerOutputStream: Duplex;
  let proxyPlayerOutputLog: string[];
  let proxyPlayerInputLog: string[];
  const playerName = 'Mazee';
  let player: Player;

  beforeEach(() => {
    proxyPlayerInputStream = new MemoryStream();
    proxyPlayerOutputStream = new MemoryStream();
    proxyPlayerOutputLog = [];
    proxyPlayerOutputStream.on('data', chunk => {
      proxyPlayerOutputLog.push(chunk.toString());
    });

    proxyPlayerInputLog = [];
    proxyPlayerInputStream.on('data', chunk => {
      proxyPlayerInputLog.push(chunk.toString());
    });

    player = new BasicPlayer(playerName, createStrategy(StrategyType.EUCLID));
  });

  afterEach(() => {
    proxyPlayerInputStream.end();
    proxyPlayerOutputStream.end();
  });

  /**
   * A helper function for setting up and handling stream-based tests.
   */
  const verify = (callback: (player: StreamPlayer) => unknown, expectCallback: () => void) => {
    // This callback only runs once, the first time we get data
    // (aka. as soon as the client sends their name)
    proxyPlayerInputStream.once('data', () => {
      const streamPlayer = new StreamPlayer(
        proxyPlayerInputStream,
        proxyPlayerOutputStream,
        'playerTest'
      );
      callback(streamPlayer);
    });

    proxyPlayerInputStream.on('data', () => expectCallback());

    initializeClient(player, proxyPlayerOutputStream, proxyPlayerInputStream);
  };

  describe('valid setup', () => {
    test('responds to goal with no state', done => {
      const expectCallback = () => {
        if (proxyPlayerInputLog.length === 2) {
          expect(proxyPlayerOutputLog[0]).toBe(
            JSON.stringify(['setup', [false, { 'row#': 1, 'column#': 1 }]])
          );
          expect(JSON.parse(proxyPlayerInputLog[1])).toBe('void');
          done();
        }
      };

      const callback = (player: StreamPlayer) => {
        player.setup(new Coordinate({ row: 1, column: 1 }));
      };

      verify(callback, expectCallback);
    });

    test('responds to goal with state', done => {
      const expectCallback = () => {
        if (proxyPlayerInputLog.length === 2) {
          expect(proxyPlayerOutputLog[0]).toBe(
            JSON.stringify([
              'setup',
              [
                {
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
                      current: { 'row#': 1, 'column#': 1 },
                      home: { 'row#': 1, 'column#': 1 },
                      color: 'red',
                    },
                    {
                      current: { 'row#': 1, 'column#': 1 },
                      home: { 'row#': 1, 'column#': 3 },
                      color: 'green',
                    },
                    {
                      current: { 'row#': 1, 'column#': 1 },
                      home: { 'row#': 1, 'column#': 5 },
                      color: 'blue',
                    },
                  ],
                  last: null,
                },
                { 'row#': 1, 'column#': 1 },
              ],
            ])
          );
          expect(JSON.parse(proxyPlayerInputLog[1])).toBe('void');
          done();
        }
      };

      const callback = (player: StreamPlayer) => {
        const gameState = deserializeState(STATE);
        const publicState = gameState.getPublicGameState();
        player.setup(new Coordinate({ row: 1, column: 1 }), publicState);
      };

      verify(callback, expectCallback);
    });
  });

  describe('valid win', () => {
    test('responds to true', done => {
      const expectCallback = () => {
        if (proxyPlayerInputLog.length === 2) {
          expect(proxyPlayerOutputLog[0]).toBe(JSON.stringify(['win', [true]]));
          expect(JSON.parse(proxyPlayerInputLog[1])).toBe('void');
          done();
        }
      };

      const callback = (player: StreamPlayer) => player.win(true);

      verify(callback, expectCallback);
    });

    test('responds to false', done => {
      const expectCallback = () => {
        if (proxyPlayerInputLog.length === 2) {
          expect(proxyPlayerOutputLog[0]).toBe(JSON.stringify(['win', [false]]));
          expect(JSON.parse(proxyPlayerInputLog[1])).toBe('void');
          done();
        }
      };

      const callback = (player: StreamPlayer) => player.win(false);

      verify(callback, expectCallback);
    });
  });

  describe('valid take-turn', () => {
    test('responds to take-turn', done => {
      const gameState = deserializeState(STATE);
      const publicState = gameState.getPublicGameState();

      const expectCallback = () => {
        if (proxyPlayerInputLog.length === 3) {
          expect(proxyPlayerOutputLog[1]).toBe(
            JSON.stringify(['take-turn', [serializePublicGameState(publicState)]])
          );
          expect(JSON.parse(proxyPlayerInputLog[1])).toBe('void');
          expect(JSON.parse(proxyPlayerInputLog[2])).toEqual([
            0,
            'LEFT',
            0,
            { 'column#': 1, 'row#': 0 },
          ]);
          done();
        }
      };

      const callback = async (player: StreamPlayer) => {
        await player.setup(new Coordinate({ row: 1, column: 1 }), publicState);
        await player.takeTurn(publicState);
      };

      verify(callback, expectCallback);
    });
  });
});
