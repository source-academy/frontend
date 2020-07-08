import GameModeMove from '../mode/move/GameModeMove';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import { IGameUI } from '../commons/CommonTypes';
import { GamePhaseType } from './GamePhaseTypes';
import GameActionManager from '../action/GameActionManager';
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
    [GamePhaseType.EscapeMenu, GameActionManager.getInstance().getGameManager().escapeManager],
    [GamePhaseType.Move, new GameModeMove()]
  ]);
