import { IGameUI } from '../../commons/CommonTypes';

/**
 * This is the phase that is active when none of
 * the mode UI's are being shown.
 *
 * It is used for dialogue/popups and notifications
 */
class GameModeSequence implements IGameUI {
  public activateUI() {}
  public deactivateUI() {}
}

export default GameModeSequence;
