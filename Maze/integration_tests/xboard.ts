import {parseJSONStream} from '../test_utility/parseJSONStream';
import {
  deserializeBoard,
  deserializeCoordinate,
  serializeCoordinate,
} from '../Serialize/Board';
import {Board} from '../Common/Board/Board';
import {isArrayOfLength, JsonDeserializeError} from '../Serialize/utils';
import { Coordinate } from '../Common/Board/Coordinate';

/**
 * Given unknown data, constructs a Board (using the given spare tile)
 * and Coordinate if the data is valid.
 */
function deserializeBoardAndCoordinate(obj: unknown): [Board, Coordinate] {
  if (isArrayOfLength(obj, 2)) {
    const board = deserializeBoard(obj[0]);
    const coordinate = deserializeCoordinate(obj[1]);
    return [board, coordinate];
  }
  throw new JsonDeserializeError(
    'Given object is not a valid Board and Coordinate pair',
    obj
  );
}

parseJSONStream(process.stdin).then(data => {
  const [board, coordinate] = deserializeBoardAndCoordinate(data);
  retrieveConnected(board, coordinate);
})

function retrieveConnected(board: Board, coordinate: Coordinate) {
  const connectedPositions = board
    .getAllConnectedTiles(coordinate)
    .toArray()
    .sort(Coordinate.compareByRowColumn);

  console.log(JSON.stringify(connectedPositions.map(serializeCoordinate)));
}
