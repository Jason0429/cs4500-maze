#### TO:         All Staff
#### FROM:       Hussain Khalil and Kincent Lan
#### CC:         CEO, Co-founders
#### DATE:       November 3, 2022
#### SUBJECT:    Proposed Remote Labyrinth Protocol
#

For communicating between the referee and network players, a well-defined protocol is necessary that is capable of exchanging current game state information and player-selected moves.

## Overview

The protocol consists of four sequential communication states:

1. Registration State:
    
    For an arbitrary amount of time prior to the start of the game, the referee will accept new connections from players interested in participating in the next game.
    
    To register, players must simply establish a connection with the referee.

2. Setup State:

    Prior to starting the game, the referee will setup the game state.

    Each client will receive requests for information the referee needs for this task, including the player name and a proposal for the initial board. 
    
    Finally, the referee will transmit the initial game state and the player's goal.
    
    The format of these messages is specified below in *Message Specifications*.

3. Game State:

    As the game is active, the referee will request a move from each player it becomes that player's turn. The player can respond with a move or a pass, as specified below in *Message Specifications*.

    The player will be informed of when they have reached their goal. Subsequently, the player must reach their assigned home tile to win.

4.  Results State:

    After a win condition occurs and the game is completed, the referee will transmit a message to each player that tells them whether or not they have won. All players will then be disconnected from the referee.

## Player Misbehavior
All of the following player behavior constitute misbehavior and will result in the player being removed from the game and the network connection being terminated.

1. A response body that doesn't conform to the specifications specified below in *Message Specifications*.
2. An well-formatted but invalid response such as a non-unique name or an illegal move.
3. Not responding to a referee request within a reasonable, referee-determined timeout period.
4. Sending any unsolicited message to the server.

## Message Specifications

For maximum flexibility, the protocol is defined as a duplex stream with UTF-8 encoding. This means the protocol can be carried out over any connection medium that supports transmitting UTF-8 characters in both directions (e.g., TCP/IP).

In addition, the characters transmitted in each direction must form a series of well-formed JSON. Each object in the series encodes a distinct message.

Messages must implement the following interface:

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

A `Request` is a message sent from the referee to the client and may contain any of the following `RequestBody`s:

### `RequestName`: sent by the referee when the player must return a new turn. The player must send a `ResponseName` in response.
```
interface RequestName {
    type: "ResponseName";
}
```

### `RequestBoardProposal`: sent by the referee during the *Setup Phase* to request a proposed initial board from the player. The player must send a `ResponseBoardProposal` in response.
```
interface RequestBoardProposal {
    type: "RequestBoardProposal";
    size: GridSize;
}
```
*See [`GridSize`](../Common/Board.ts).*

### `PlayerSetupRequest`: sent by the referee in two circumstances: (1) immediately before the game starts to inform the player of the initial game state, and (2) when the player reaches their goal tile and needs to return home.

### There is no response to this message.

```
interface PlayerSetupRequest {
    type: "PlayerSetupRequest";
    stateInfo?: StateInfo;
    goal: Coordinate;
}
```
*See [`Coordinate`](../Common/Board.ts).*

### `TakeTurnRequest`: sent by the referee to indicate the player's turn is up and the inform the player of the current game state. The player must send a `TakeTurnResponse` in response.
```
interface TakeTurnRequest {
    type: "TakeTurnRequest";
    stateInfo: StateInfo;
}
```

### `PlayerResult`: sent by the referee when the games ends to inform the player of whether they have won.

### There is no response to this message.

```
interface PlayerResult {
    type: "PlayerResult";
    won: boolean;
}
```

#

A `Response` is a message sent from the client to the referee and may contain any of the following `ResponseBody`s:

### `ResponseName`: sent by the player in response to a `RequestName` request from the referee.

### A `ResponseName` message is only valid if no currently registered player has previously reported the same name.

### The player must respond with the same name every time.
```
interface ResponseName {
    type: "ResponseName";
    name: string;
}
```

### `ResponseBoardProposal`: sent by the player in response to a `RequestBoardProposal` request from the referee.
```
interface ResponseBoardProposal {
    type: "ResponseBoardProposal";
    board: Board;
}
```
*See [`Board`](../Common/Board.ts).*

### `TakeTurnResponse`: sent by the player in response to a `TakeTurnRequest` request from the referee. If the player chooses to respond with a board action, it must be legal for the current game state.
```
interface TakeTurnResponse {
    type: "TakeTurnResponse";
    action: Move | Pass;
}
```
*See [`Move`](../Common/Action.ts) and [`Pass`](../Common/Action.ts).*

*Note: Messages will be serialized to a JSON-compatible representation before being transmitted.*

### Implementation
The above protocol will be implemented using a remote-proxy pattern in the server:

`NetworkPlayer` is an implementation of `Player` and will abstract the network communication specified above into an API that can be used by the referee.

When a player connects to the server, the server will instantiate and assign a `NetworkPlayer` to that connection. Any time a request is called from the referee, the `NetworkPlayer` will relay that call and its parameters to the player, and will listen for a response from the player afterwards. The response is then return to the referee.

If a player is kicked, the referee will simply stop sending requests to the `NetworkPlayer` and the player will not be able to send messages to the server.
