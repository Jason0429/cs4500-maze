import { Coordinate } from '../Common/Board/Coordinate';
import { GridSize } from '../Common/Board/GridSize';
import { Player } from '../Players/Player';
import { PublicGameState } from '../Common/State/PublicGameState';
import { BadPSCount, JsonBadFM } from '../Serialize/BadPS';

export class BadPlayer2 implements Player {
  /**
   * The number of calls made so far to the `functionName`
   */
  private callsMade: number;

  constructor(
    private readonly player: Player,
    private readonly functionName: JsonBadFM,
    private readonly count: BadPSCount
  ) {
    this.callsMade = 0;
  }

  private async loop(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Essentially a `sleep` function. 1,234ms is an arbitrary number.
      await new Promise(r => setTimeout(r, 1_234));
    }
  }

  public async name() {
    return this.player.name();
  }

  public async proposeBoard0(size: GridSize) {
    return this.player.proposeBoard0(size);
  }

  public async setup(goal: Coordinate, stateInfo?: PublicGameState) {
    if (this.functionName === 'setUp') {
      this.callsMade += 1;
      if (this.callsMade === this.count) {
        await this.loop();
      }
    }
    return this.player.setup(goal, stateInfo);
  }

  public async takeTurn(stateInfo: PublicGameState) {
    if (this.functionName === 'takeTurn') {
      this.callsMade += 1;
      if (this.callsMade === this.count) {
        await this.loop();
      }
    }
    return this.player.takeTurn(stateInfo);
  }

  public async win(w: boolean) {
    if (this.functionName === 'win') {
      this.callsMade += 1;
      if (this.callsMade === this.count) {
        await this.loop();
      }
    }
    return this.player.win(w);
  }
}

export class BadPlayer implements Player {
  constructor(
    private readonly player: Player,
    private readonly functionName: JsonBadFM
  ) {
  }

  public name() {
    return this.player.name();
  }

  public proposeBoard0(size: GridSize) {
    return this.player.proposeBoard0(size);
  }

  public setup(goal: Coordinate, stateInfo?: PublicGameState) {
    if (this.functionName === 'setUp') {
      throw new Error("Javascript doesn't treat 1 / 0 as an error :)")
    }
    return this.player.setup(goal, stateInfo);
  }

  public takeTurn(stateInfo: PublicGameState) {
    if (this.functionName === 'takeTurn') {
      throw new Error("Javascript doesn't treat 1 / 0 as an error :)")
    }
    return this.player.takeTurn(stateInfo);
  }

  public win(w: boolean) {
    if (this.functionName === 'win') {
      throw new Error("Javascript doesn't treat 1 / 0 as an error :)")
    }
    return this.player.win(w);
  }
}



