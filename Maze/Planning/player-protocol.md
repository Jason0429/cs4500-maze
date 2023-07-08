#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       October 20, 2022
#### SUBJECT:    Proposed Player Protocol
#

For communicating between the referee and players, a well-defined protocol is necessary that is capable of exchanging current game state information and player-selected moves.

In addition, the protocol must support auxillary game functions like player registration and announcing when the game is over.

## Overview

The phases of the protocol are:

Client Registration:
- Registration period waits up to a specified amount of time before starting the game.

Prior to starting the game:
- Client connects to the server.
- Server sends a message back to the client signaling their UUID and treasure.

After a specified amount of time:
- Server sends message to every player, says game is starting

Game phase:
- The game server will request the player's next move (with StateInfo) and the player responds.
- Once it executes an action/pass, the server will send a message to all players detailing the StateInfo. (no request for any player)

Game over phase:
- The server announces the result of the game, either a winner or draw
- A new game is initiated, returning the to client registration phase.

## Message Specifications

For maximum flexibility, the protocol is defined as a duplex stream with UTF-8 encoding. This means the protocol can be carried out over any connection medium that supports transmitting UTF-8 characters in both directions (e.g., TCP/IP).

In addition, the characters transmitted in each direction must form a series of well-formed JSON. Each object in the series encodes a distinct message.

Messages must extend the following interface:

```
type Message = Request | Response

interface Request {
    type: "REQUEST";
    id: UUID;
    body: RequestBody;
}

interface Response {
    type: "RESPONSE";
    id: UUID;
    body: ResponseBody;
}
```

*Note: [UUID](https://www.ietf.org/rfc/rfc4122.txt) is 32-character unique identifier for each request-response message pair.*

A `Request` is a message sent from the server to the client and may contain any of the following `RequestBody`s:

### `RequestAction`: sent by the server when the player must return a new turn. The player must send a `ResponseAction` in response.
```
interface RequestAction {
    type: "RequestAction";
    turnInfo: PlayerTurnRoundInfo;
    stateInfo: StateInfo;
}
```
*See [`PlayerTurnRoundInfo`](../Common/PlayerTurnRoundInfo.ts) and [`StateInfo`](../Common/StateInfo.ts)*.

### `StateUpdate`: sent by the server when another player has completed their turn and the game has changed state. No response is expected from the player.
```
interface StateUpdate {
    type: "StateUpdate";
    turnInfo: PlayerTurnRoundInfo;
    stateInfo: StateInfo;
}
```

### `Registration`: sent by the server when a new player connects. No response is expected from the player. 
```
interface Registration {
    type: "Registration";
    playerId: UUID;
    treasure: GemPair;
}
```
*See [`GemPair`](../Common/Gem.ts).*

### `GameStart`: sent by the server to indicate the game is starting. No response is expected from the player.
```
interface GameStart {
    type: "GameStart";
    turnInfo: PlayerTurnRoundInfo;
    stateInfo: StateInfo;
}
```

### `RegistrationOver`: sent by the server to indicate the registration period is already over and the player must wait until the current game is over to register. No response is expected from the player.
```
interface RegistrationOver {
    type: "RegistrationOver";
}
```

### `GameOver`: sent by the server to all players to indicate the game is over and announce the  or a draw result. No response is expected from the player.
```
interface GameOver {
    type: "GameOver";
    winner: UUID | "DRAW";
}
```

#

A `Response` is a message sent from the client to the server and may contain any of the following `ResponseBody`s:

### `ResponseAction`: sent by the client in response to a `RequestAction` messages.
```
interface ResponseAction {
    type: "ResponseAction";
    move: Move;
}
```
*See [`Move`](../Common/Move.ts).*