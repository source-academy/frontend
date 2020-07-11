import GameModeMove from '../mode/move/GameModeMove';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import { IGameUI } from '../commons/CommonTypes';
import { GamePhaseType } from './GamePhaseTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameModeExplore from '../mode/explore/GameModeExplore';

class GameModeSequence implements IGameUI {
  public activateUI() {}
  public deactivateUI() {}
}

export const createGamePhases = () =>
  new Map([
    [GamePhaseType.Menu, new GameModeMenu()],
    [GamePhaseType.Sequence, new GameModeSequence()],
    [GamePhaseType.Explore, new GameModeExplore()],
    [GamePhaseType.None, new GameModeSequence()],
    [GamePhaseType.Talk, new GameModeTalk()],
    [GamePhaseType.EscapeMenu, GameGlobalAPI.getInstance().getGameManager().escapeManager],
    [GamePhaseType.Move, new GameModeMove()]
  ]);
