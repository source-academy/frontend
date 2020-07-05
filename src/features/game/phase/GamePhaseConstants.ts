import { GamePhaseType, GamePhase } from './GamePhaseTypes';
import { createMapWithKey } from '../utils/GameUtils';
import GameModeMove from '../mode/move/GameModeMove';
import GameModeExplore from '../mode/explore/GameModeExplore';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import { Constants } from '../commons/CommonConstants';
import GameManager from '../scenes/gameManager/GameManager';

export const createGamePhaseMap = (gameManager: GameManager) => {
  const gameModeMenu = new GameModeMenu(gameManager);
  const gameModeTalk = new GameModeTalk(gameManager);
  const gameModeExplore = new GameModeExplore(gameManager);
  const gameModeMove = new GameModeMove(gameManager);
  const gamePhaseMap = [
    {
      type: GamePhaseType.None,
      activate: Constants.nullFunction,
      deactivate: Constants.nullFunction
    },
    {
      type: GamePhaseType.Menu,
      activate: async () => await gameModeMenu.activateUI(),
      deactivate: () => gameModeMenu.deactivateUI()
    },
    {
      type: GamePhaseType.Talk,
      activate: async () => await gameModeTalk.activateUI(),
      deactivate: () => gameModeTalk.deactivateUI()
    },
    {
      type: GamePhaseType.Explore,
      activate: async () => await gameModeExplore.activateUI(),
      deactivate: () => gameModeExplore.deactivateUI()
    },
    {
      type: GamePhaseType.Move,
      activate: async () => await gameModeMove.activateUI(),
      deactivate: async () => await gameModeMove.deactivateUI()
    },
    {
      type: GamePhaseType.Sequence,
      activate: Constants.nullFunction,
      deactivate: Constants.nullFunction
    },
    {
      type: GamePhaseType.EscapeMenu,
      activate: () => gameManager.getEscapeManager().createEscapeMenu(),
      deactivate: () => gameManager.getEscapeManager().destroyEscapeMenu()
    }
  ];
  return createMapWithKey(gamePhaseMap, 'type') as Map<string, GamePhase>;
};
