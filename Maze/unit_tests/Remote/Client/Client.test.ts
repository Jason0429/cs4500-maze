import MemoryStream from 'memorystream';
import { Duplex, Writable } from 'stream';
import { initializeClient } from '../../../Client/Client';
import { BasicPlayer, Player } from '../../../Players/Player';
import { createStrategy, StrategyType } from '../../../Players/Strategy';
import { STATE } from './Referee.test';
import { JsonChoice } from '../../../Serialize/Strategy';


describe('client I/O', () => {
  let inputStream: Duplex;
  let outputStream: Writable;
  let serverLog: string[];
  const playerName = 'Mazee';
  let player: Player;

  beforeEach(() => {
    inputStream = new MemoryStream();
    outputStream = new MemoryStream();
    serverLog = [];
    outputStream.on('data', chunk => {
      serverLog.push(chunk.toString());
    });

    player = new BasicPlayer(playerName, createStrategy(StrategyType.EUCLID));
  });

  afterEach(() => {
    inputStream.end();
    outputStream.end();
  });

  test('client responds with their name', done => {
    outputStream.on('data', data => {
      expect(JSON.parse(data.toString())).toBe(playerName);
      done();
    });

    initializeClient(player, inputStream, outputStream);
  });

  describe('responds to valid setup calls', () => {
    test('responds to a false state', done => {
      outputStream.on('data', data => {
        if (JSON.parse(data.toString()) !== playerName) {
          expect(JSON.parse(serverLog[1])).toEqual('void');
          done();
        }
      });

      initializeClient(player, inputStream, outputStream);

      inputStream.write(
        JSON.stringify(['setup', [false, { 'row#': 1, 'column#': 1 }]])
      );

      inputStream.end();
    });

    test('responds to a real State', done => {
      outputStream.on('data', data => {
        if (JSON.parse(data.toString()) !== playerName) {
          expect(JSON.parse(serverLog[1])).toEqual('void');
          done();
        }
      });

      initializeClient(player, inputStream, outputStream);

      inputStream.write(
        JSON.stringify(['setup', [STATE, { 'row#': 1, 'column#': 1 }]])
      );

      inputStream.end();
    });
  });

  describe('responds to win calls', () => {

    const validateWin = (value: unknown) => (done: jest.DoneCallback) => {
      outputStream.on('data', data => {
        if (JSON.parse(data.toString()) !== playerName) {
          expect(JSON.parse(serverLog[1])).toEqual('void');
          done();
        }
      });

      initializeClient(player, inputStream, outputStream);

      inputStream.write(
        JSON.stringify(['win', [value]])
      );

      inputStream.end();
    }


    test('responds to win true', validateWin(true));
    test('responds to win false', validateWin(false));
  });

  describe('responds to valid take-turn calls', () => {

    const validateTakeTurn = (value: JsonChoice) => (done: jest.DoneCallback) => {
      outputStream.on('data', _data => {
        if (serverLog.length === 2) {
          expect(JSON.parse(serverLog[1])).toEqual('void');
        }
        if (serverLog.length === 3) {
          expect(JSON.parse(serverLog[2])).toEqual(value);
          done();
        }
      });

      initializeClient(player, inputStream, outputStream);

      inputStream.write(
        JSON.stringify(['setup', [STATE, { 'row#': 1, 'column#': 1 }]])
      );

      inputStream.write(
        JSON.stringify(['take-turn', [STATE]])
      );

      inputStream.end();
    }

    test('responds to take-turn', validateTakeTurn([0, 'LEFT', 0, { 'row#': 0, 'column#': 1 }]));
  });
});
