import { GamePhaseType } from './GamePhaseTypes';
import { createMapWithKey } from '../utils/GameUtils';
import GameModeMove from '../mode/move/GameModeMove';
import GameModeExplore from '../mode/explore/GameModeExplore';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import GameActionManager from '../action/GameActionManager';
import { Constants } from '../commons/CommonConstants';
import { displayNotification } from '../effects/Notification';

const gameModeMenu = new GameModeMenu();
const gameModeTalk = new GameModeTalk();
const gameModeExplore = new GameModeExplore();
const gameModeMove = new GameModeMove();

const gamePhases = [
  {
    gamePhaseType: GamePhaseType.Menu,
    activate: async () => await gameModeMenu.activateUI(),
    deactivate: () => gameModeMenu.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Talk,
    activate: async () => await gameModeTalk.activateUI(),
    deactivate: () => gameModeTalk.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Explore,
    activate: async () => await gameModeExplore.activateUI(),
    deactivate: () => gameModeExplore.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Move,
    activate: async () => await gameModeMove.activateUI(),
    deactivate: async () => await gameModeMove.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Dialogue,
    activate: (phaseParams: any) =>
      GameActionManager.getInstance().getGameManager().dialogueManager.playDialogue(phaseParams.id),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.Popup,
    activate: (phaseParams: any) =>
      GameActionManager.getInstance().displayPopUp(phaseParams.id, phaseParams.position),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.Notification,
    activate: async (phaseParams: any) => await displayNotification(phaseParams.id),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.None,
    activate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.EscapeMenu,
    activate: () =>
      GameActionManager.getInstance().getGameManager().escapeManager.createEscapeMenu(),
    deactivate: Constants.nullFunction
  }
];
export const gamePhaseMap = createMapWithKey(gamePhases, 'gamePhaseType');
