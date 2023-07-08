import {Observer} from './Observer';
import {GameResult} from './GameResult';
import {JSONGameResult, JSONGameState, serializeGameResult, serializeGameState} from '../Utility/JSONGameState';
import {GameState} from '../Common/State/GameState';

/**
 * Types for updates sent to the parent process.
 */
export type GameUpdate = GameOverUpdate | StateUpdate;

export interface GameOverUpdate {
    type: GameUpdateType.GAME_OVER;
    result: JSONGameResult;
}

export interface StateUpdate {
    type: GameUpdateType.UPDATE;
    state: JSONGameState
    passed: number;
}

export enum GameUpdateType {
    UPDATE = 'UPDATE',
    GAME_OVER = 'GAME_OVER'
}

/**
 * Implementation of {@link Observer} that sends {@link GameUpdate}s to
 * some parent process via {@link process.send}.
 */
export class ProcessObserver implements Observer {
    private readonly send: (message: unknown) => void;

    constructor() {
        if (process?.send === undefined) {
            throw 'Unable to initialize ForkObserver: process.send does not exist.';
        } else {
            this.send = process.send.bind(process);
        }
    }

    async gameOver(result: GameResult): Promise<void> {
        const gameOverUpdate: GameOverUpdate = {
            type: GameUpdateType.GAME_OVER,
            result: await serializeGameResult(result)
        };
        this.send(gameOverUpdate);
    }

    stateUpdate(state: GameState, passed: number): void {
        const stateUpdate: StateUpdate = {
            type: GameUpdateType.UPDATE,
            state: serializeGameState(state),
            passed
        };
        this.send(stateUpdate);
    }
}
