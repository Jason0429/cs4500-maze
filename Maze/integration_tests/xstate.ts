import {GameState} from '../Common/State/GameState';
import {parseJSONStream} from '../test_utility/parseJSONStream';
import {SlideAction, SlideActionWithRotation} from '../Common/Board/SlideAction';
import { deserializeDegrees, deserializeDirection, deserializeState } from '../Serialize/GameState';
import { isArrayOfLength, isNumber, JsonDeserializeError } from '../Serialize/utils';
import { serializeCoordinate } from '../Serialize/Board';
import { Coordinate } from '../Common/Board/Coordinate';

/**
 * Given unknown data, constructs a Board (using the given spare tile)
 * and Coordinate if the data is valid.
 */
function deserializeXStateJson(
  obj: unknown
): [GameState, SlideActionWithRotation] {
  if (isArrayOfLength(obj, 4)) {
    const state = deserializeState(obj[0]);
    const direction = deserializeDirection(obj[2]);
    const degree = deserializeDegrees(obj[3]);

    if (isNumber(obj[1])) {
        const action: SlideActionWithRotation = {
            direction: direction,
            index: obj[1],
            rotations: degree / 90
        }

        return [state, action]
    }
  }

  throw new JsonDeserializeError(
    'Given object is not a valid XState input',
    obj
  );
}


parseJSONStream(process.stdin).then(data => {
    const [state, action] =
        deserializeXStateJson(data);

    moveTest(state, action);
});

function moveTest(state: GameState, action: SlideActionWithRotation) {
    const coordinates = state.activePlayerCanMoveTo(action).toArray();
    coordinates.sort(Coordinate.compareByRowColumn);
    console.log(JSON.stringify(coordinates.map(serializeCoordinate)));
}
