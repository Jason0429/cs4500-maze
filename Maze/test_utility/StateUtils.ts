import {PublicPlayerState} from '../Common/PublicPlayerState';
import {Random} from '../Utility/Random';
import {GameState} from '../Common/State/GameState';
import {BoardUtils} from './BoardUtils';
import {SlideAction} from '../Common/Board/SlideAction';
import { Coordinate } from '../Common/Board/Coordinate';

export class StateUtils {

  /**
   * {@deprecated Please use {@link Random}.avatars }
   */
    static generateAvatar(initialPosition?: Coordinate): PublicPlayerState {
        initialPosition = initialPosition || new Coordinate({row: 0, column: 0});
        return {
            position: initialPosition,
            home: initialPosition,
            color: new Random().color(),
        }
    }

    static sameAvatar(player: PublicPlayerState, otherPlayer: PublicPlayerState): boolean {
        return otherPlayer.position.equals(player.position) &&
            otherPlayer.home.equals(player.home) &&
            otherPlayer.color.equals(player.color)
    }

    static sameAvatars(players: readonly PublicPlayerState[], otherPlayers: readonly PublicPlayerState[]) {
      if (players.length !== otherPlayers.length) return false;
      for (let i = 0; i < players.length; i++) {
        if (!this.sameAvatar(players[i], otherPlayers[i])) return false;
      }
      return true;
    }

    static slideActionsEqual(action1?: SlideAction, action2?: SlideAction) {
      if (action1 === undefined || action2 === undefined) return action1 === action2;
      return BoardUtils.slideActionEqual(action1, action2);
    }
}
