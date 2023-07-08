// automate running all the integration tests configured below
// ensures test inputs produce results with deep equality to outputs

import { createReadStream, readdirSync } from 'fs';
import { Readable } from 'stream';
import { resolve } from 'path';
import { spawn } from 'child_process';
import { parseJSONStream } from '../test_utility/parseJSONStream';

jest.setTimeout(200_000);

// interface to configure tests
interface IntegrationTest {
  name: string;
  executablePath: string;
  testDir: string;
}

const TESTS: IntegrationTest[] = [
  { name: 'board', executablePath: '../../3/xboard', testDir: '../../3/Tests' },
  { name: 'board - instructor tests', executablePath: '../../3/xboard', testDir: './TestInputs/3' },
  { name: 'state', executablePath: '../../4/xstate', testDir: '../../4/Tests' },
  { name: 'state - instructor tests', executablePath: '../../4/xstate', testDir: './TestInputs/4' },
  { name: 'strategy', executablePath: '../../5/xchoice', testDir: '../../5/Tests' },
  {
    name: 'strategy - instructor tests',
    executablePath: '../../5/xchoice',
    testDir: './TestInputs/5',
  },
  { name: 'games', executablePath: '../../6/xgames', testDir: '../../6/Tests' },
  { name: 'games - instructor tests', executablePath: '../../6/xgames', testDir: './TestInputs/6' },
  { name: 'bad_player', executablePath: '../../7/xbad', testDir: '../../7/Tests' },
  { name: 'bad_player instructor tests', executablePath: '../../7/xbad', testDir: './TestInputs/7' },
  { name: 'bad_player2', executablePath: '../../8/xbad2', testDir: '../../8/Tests' },
  {
    name: 'bad_player2 instructor tests',
    executablePath: '../../8/xbad2',
    testDir: './TestInputs/8',
  },
  {
    name: 'xserver xclients',
    executablePath: '../../10/Other/xrun',
    testDir: '../../10/Tests'
  },
  {
    name: 'xserver xclients instructor tests',
    executablePath: '../../10/Other/xrun',
    testDir: './TestInputs/9/ForStudents'
  },
  {
    name: 'xserver xclients instructor tests',
    executablePath: '../../10/Other/xrun',
    testDir: './TestInputs/10'
  }
];

describe('Running all integration tests', () => {
  for (const integration of TESTS) {
    describe(`Integration test ${integration.name}`, () => {
      const testStreams = detectInputOutput(resolve(__dirname, integration.testDir));

      test('Each integration test should have IO pairs', () => {
        expect(testStreams.length).toBeGreaterThan(0);
      });

      for (const [name, input, expectedOutputStream] of testStreams) {
        test.concurrent(name, async () => {
          const child = spawn(resolve(__dirname, integration.executablePath));
          input.pipe(child.stdin);
          const [output, expectedOutput] = await Promise.all([
            parseJSONStream(child.stdout),
            parseJSONStream(expectedOutputStream),
          ]);
          expect(output).toEqual(expectedOutput);
        });
      }
    });
  }
});


/**
 * Checks if we should test a given directory.
 * Useful for when we don't want to run the whole, exhaustive suite
 * (which includes all past student tests from testfests)
 */
function shouldTestDirectory(dirName: string): boolean {
  const allowAll = process.env.ALL !== undefined;
  return allowAll || ['staff-tests', 'ForStudents'].includes(dirName);
}

/**
 * Gets all files in the given directory, two levels deep.
 * Eg. if given `main/`, this will get `main/dir/file.json` as well as `main/file.json`
 */
function getAllTestFiles(testDir: string): Array<string> {
  const dirObjs = readdirSync(testDir, { withFileTypes: true });
  const files = dirObjs.map(obj => {
    const path = resolve(testDir, obj.name);

    if (obj.isDirectory() && shouldTestDirectory(obj.name)) {
      return getAllTestFiles(path);
    }
    return path;
  });

  return files.flat();
}

/**
 * Returns an array of file pairs. A "pair" is two file paths, where the first
 * file is the input file, and the second is the output file of a test.
 */
function getTestPairFiles(testDir: string): Array<[string, string]> {
  const INPUT_SUFFIX = 'in.json';
  const OUTPUT_SUFFIX = 'out.json';
  const files = getAllTestFiles(testDir);
  const inputFiles = files.filter(f => f.split('-').at(-1) === INPUT_SUFFIX);
  return inputFiles.map(f => {
    return [f, `${f.slice(0, -INPUT_SUFFIX.length)}${OUTPUT_SUFFIX}`];
  });
}

function detectInputOutput(testDir: string): Array<[string, Readable, Readable]> {
  const testPairs = getTestPairFiles(testDir);
  return testPairs.map(([inFile, outFile]) => [
    inFile,
    createReadStream(inFile),
    createReadStream(outFile),
  ]);
}
