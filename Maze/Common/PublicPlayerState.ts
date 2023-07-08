import {Color} from '../Utility/Color';
import { Coordinate } from './Board/Coordinate';

export interface PublicPlayerState {

  /**
   * The player's unique avatar color used for rendering.
   */
  readonly color: Color;

  /**
   * The current location of the player on the board.
   */
  position: Coordinate;

  /**
   * The location of the player's home tile.
   */
  readonly home: Coordinate;
}
