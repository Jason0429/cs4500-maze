import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';
import {Player} from '../Players/Player';
import {PublicGameState} from '../Common/State/PublicGameState';

export function mockPlayers(players: Player[]): [MockPlayer[], RefereeMessage[]] {
    const log: RefereeMessage[] = [];
    const mockPlayers: MockPlayer[] = players.map(player => new MockPlayer(log, player));
    return [mockPlayers, log]
}

export interface RefereeMessage {
    playerName: string;
    methodName: string;
    args: unknown[];
    result: unknown
}

export class MockPlayer implements Player {
    constructor(
        private readonly log: RefereeMessage[],
        private readonly player: Player,
    ) {}

    public async name() {
      const result = await this.player.name();
      this.log.push({
          playerName: await this.player.name(),
          methodName: 'name',
          args: [],
          result: result
      });
      return result;
    }

    public async proposeBoard0(size: GridSize) {
      const board = await this.player.proposeBoard0(size);

      this.log.push({
            playerName: await this.player.name(),
            methodName: 'proposeBoard0',
            args: [size],
            result: board
        });

      return board;
    }

    public async setup(goal: Coordinate, stateInfo?: PublicGameState) {
        const result = await this.player.setup(goal, stateInfo);
        this.log.push({
            playerName: await this.player.name(),
            methodName: 'setup',
            args: [stateInfo, goal],
            result: result
        });
        return result;
    }

    public async takeTurn(stateInfo: PublicGameState) {
        const result = await this.player.takeTurn(stateInfo);
        this.log.push({
            playerName: await this.player.name(),
            methodName: 'takeTurn',
            args: [stateInfo],
            result: result
        });
        return result;
    }

    public async win(w: boolean) {
      const result = await this.player.win(w);
      this.log.push({
            playerName: await this.player.name(),
            methodName: 'win',
            args: [w],
            result: result
        });
      return result;
    }
}
