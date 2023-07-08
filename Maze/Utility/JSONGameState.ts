import { Map as ImmutableMap } from 'immutable';
import { PublicPlayerState } from '../Common/PublicPlayerState';
import { BasicGameState, GameState, PrivatePlayerInfo } from '../Common/State/GameState';
import { Color } from './Color';
import { GameResult } from '../Referee/GameResult';
import { deserializeColor, deserializeSlideAction, deserializeTile, JsonSlideAction, JsonTile, serializeSlideAction, serializeTile } from '../Serialize/GameState';
import { deserializeBoard, deserializeCoordinate, JsonBoard, JsonCoordinate, serializeBoard, serializeCoordinate } from '../Serialize/Board';

// TODO - this is used with the Observer. Merge with Serialze/
/**
 * Serializes a {@link GameResult} to a JSON.stringify-safe representation.
 */
export async function serializeGameResult(result: GameResult): Promise<JSONGameResult> {
    return {
        winners: await Promise.all(result.winners.valueSeq().map(player => player.name()).toArray()),
        removed: await Promise.all(result.removed.valueSeq().map(player => player.name()).toArray())
    }
}

/**
 * Serializes a {@link GameState} to a JSON.stringify-safe representation.
 */
export function serializeGameState(state: GameState): JSONGameState {
    return {
        avatars: state.getPlayerStates().map(avatar => serializeAvatar(avatar, state)),
        board: serializeBoard(state.getBoard()),
        spareTile: serializeTile(state.getSpareTile()),
        activePlayerColor: state.getActivePlayerState().color.color,
        lastAction: serializeSlideAction(state.getLastSlideAction())
    }
}

/**
 * Deserializes a {@link JSONGameState} to a functionally identical GameState implementation
 * instance.
 */
export function deserializeGameState(state: JSONGameState): GameState {
    return new BasicGameState(
        state.avatars.map(avatar => deserializeAvatar(avatar)),
        deserializeBoard(state.board),
        deserializeTile(state.spareTile),
        deserializePrivatePlayerInfo(state.avatars),
        deserializeSlideAction(state.lastAction)
    );
}

export interface JSONGameResult {
    winners: string[];
    removed: string[];
}

export interface JSONGameState {
    avatars: JsonAvatar[];
    board: JsonBoard;
    spareTile: JsonTile;
    activePlayerColor: string;
    lastAction: JsonSlideAction | undefined;
}

interface JsonAvatar {
    color: string;
    position: JsonCoordinate;
    goal: JsonCoordinate;
    hasReachedAllGoals: boolean;
    home: JsonCoordinate;
}

function serializeAvatar(avatar: PublicPlayerState, gameState: GameState): JsonAvatar {
    return {
        color: avatar.color.color,
        position: serializeCoordinate(avatar.position),
        home: serializeCoordinate(avatar.home),
        goal: serializeCoordinate(gameState.getPlayerGoal(avatar.color)),
        hasReachedAllGoals: gameState.hasPlayerReachedAllGoals(avatar.color)
    }
}

function deserializeAvatar(avatar: JsonAvatar): PublicPlayerState {
    return {
        color: new Color(avatar.color),
        position: deserializeCoordinate(avatar.position),
        home: deserializeCoordinate(avatar.home),
    }
}

function deserializePrivatePlayerInfo(avatars: JsonAvatar[]): ImmutableMap<Color, PrivatePlayerInfo> {
    let playerInfo = ImmutableMap<Color, PrivatePlayerInfo>();
    for (const avatar of avatars) {
        playerInfo = playerInfo.set(deserializeColor(avatar.color), {
            hasReachedAllGoals: avatar.hasReachedAllGoals,
            goto: deserializeCoordinate(avatar.goal),
            treasuresCollected: 0,
            hasReturnedHome: false
        });
    }

    return playerInfo;
}
