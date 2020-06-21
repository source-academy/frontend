import { GamePhaseType, GamePhase } from './GamePhaseTypes';
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

const gamePhases: GamePhase[] = [
  {
    type: GamePhaseType.None,
    activate: Constants.nullFunction,
    reactivate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  },
  {
    type: GamePhaseType.Menu,
    activate: async () => await gameModeMenu.activateUI(),
    reactivate: async () => await gameModeMenu.activateUI(),
    deactivate: () => gameModeMenu.deactivateUI()
  },
  {
    type: GamePhaseType.Talk,
    activate: async () => await gameModeTalk.activateUI(),
    reactivate: async () => await gameModeTalk.activateUI(),
    deactivate: () => gameModeTalk.deactivateUI()
  },
  {
    type: GamePhaseType.Explore,
    activate: async () => await gameModeExplore.activateUI(),
    reactivate: async () => await gameModeExplore.activateUI(),
    deactivate: () => gameModeExplore.deactivateUI()
  },
  {
    type: GamePhaseType.Move,
    activate: async () => await gameModeMove.activateUI(),
    reactivate: async () => await gameModeMove.activateUI(),
    deactivate: async () => await gameModeMove.deactivateUI()
  },
  {
    type: GamePhaseType.Dialogue,
    activate: (phaseParams: any) =>
      GameActionManager.getInstance().getGameManager().dialogueManager.playDialogue(phaseParams.id),
    reactivate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  },
  {
    type: GamePhaseType.Popup,
    activate: (phaseParams: any) =>
      GameActionManager.getInstance()
        .getGameManager()
        .popUpManager.displayPopUp(phaseParams.id, phaseParams.position, phaseParams.duration),
    reactivate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  },
  {
    type: GamePhaseType.Notification,
    activate: async (phaseParams: any) => await displayNotification(phaseParams.id),
    reactivate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  },
  {
    type: GamePhaseType.EscapeMenu,
    activate: () =>
      GameActionManager.getInstance().getGameManager().escapeManager.createEscapeMenu(),
    reactivate: Constants.nullFunction,
    deactivate: () =>
      GameActionManager.getInstance().getGameManager().escapeManager.destroyEscapeMenu()
  }
];
export const gamePhaseMap = createMapWithKey(gamePhases, 'type');
