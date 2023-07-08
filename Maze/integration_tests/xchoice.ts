import { PublicPlayerState } from '../Common/PublicPlayerState';
import { GameState } from '../Common/State/GameState';
import { BasicPublicGameState, PublicGameState } from '../Common/State/PublicGameState';
import { createStrategy, Strategy } from '../Players/Strategy';
import { parseJSONStream } from '../test_utility/parseJSONStream';
import {
  deserializeStrategyDesignation,
  serializeAction,
} from '../Serialize/Strategy';
import { deserializeCoordinate } from '../Serialize/Board';
import { deserializeState } from '../Serialize/GameState';
import { isArrayOfLength, JsonDeserializeError } from '../Serialize/utils';

function deserializeXchoiceJson(
  obj: unknown
): [
    Strategy,
    GameState
  ] {
  if (isArrayOfLength(obj, 3)) {
    const goal = deserializeCoordinate(obj[2])
    const strategyType = deserializeStrategyDesignation(obj[0]);
    const strategy = createStrategy(strategyType);
    const state = deserializeState(obj[1], undefined, goal);

    return [strategy, state];
  }

  throw new JsonDeserializeError(
    'Given object is not a valid XChoice input',
    obj
  );
}

parseJSONStream(process.stdin).then(data => {
  const [strategy, state] = deserializeXchoiceJson(data);

  strategyTest(strategy, state);
});

function strategyTest(
  strategy: Strategy,
  gameState: GameState
) {
  const publicState = gameState.getPublicGameState();
  const activePlayerState: PublicPlayerState = gameState.getActivePlayerState();

  console.log(
    JSON.stringify(
      serializeAction(
        strategy.computeAction(
          publicState,
          gameState.getPlayerGoal(activePlayerState.color),
          activePlayerState.color
        )
      )
    )
  );
}
