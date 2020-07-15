import { IGameUI } from '../../commons/CommonTypes';

/**
 * This is the phase that is active when dialogues,
 * notifications, and popups are playing.
 *
 * None of the UI's are being shown at during this phase.
 */
class GameModeSequence implements IGameUI {
  public activateUI() {}
  public deactivateUI() {}
}

export default GameModeSequence;
