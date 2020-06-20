import { GamePhaseType } from './GamePhaseTypes';
import { createMapWithKey } from '../utils/GameUtils';
import GameModeMove from '../mode/move/GameModeMove';
import GameModeExplore from '../mode/explore/GameModeExplore';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import GameActionManager from '../action/GameActionManager';
import { Constants } from '../commons/CommonConstants';
import { displayNotification } from '../effects/Notification';

const gameModeMenu = new GameModeMenu('room');
const gameModeTalk = new GameModeTalk('room');
const gameModeExplore = new GameModeExplore('room');
const gameModeMove = new GameModeMove('room');

const gamePhases = [
  {
    gamePhaseType: GamePhaseType.Menu,
    activate: () => gameModeMenu.activate(),
    deactivate: () => gameModeMenu.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Talk,
    activate: () => gameModeTalk.activate(),
    deactivate: () => gameModeTalk.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Explore,
    activate: () => gameModeExplore.activate(),
    deactivate: () => gameModeExplore.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Move,
    activate: () => gameModeMove.activate(),
    deactivate: () => gameModeMove.deactivateUI()
  },
  {
    gamePhaseType: GamePhaseType.Dialogue,
    activate: ({ id }: any) =>
      GameActionManager.getInstance().getGameManager().dialogueManager.playDialogue(id),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.Popup,
    activate: ({ id, position }: any) => GameActionManager.getInstance().displayPopUp(id, position),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.Notification,
    activate: ({ id }: any) => displayNotification(id),
    deactivate: Constants.nullFunction
  },
  {
    gamePhaseType: GamePhaseType.None,
    activate: Constants.nullFunction,
    deactivate: Constants.nullFunction
  }
];
export const gamePhaseMap = createMapWithKey(gamePhases, 'gamePhaseType');
