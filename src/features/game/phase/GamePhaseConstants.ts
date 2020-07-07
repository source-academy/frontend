import { GamePhaseType, GamePhase } from './GamePhaseTypes';
import { createMapWithKey } from '../utils/GameUtils';
import GameModeMove from '../mode/move/GameModeMove';
import GameModeExplore from '../mode/explore/GameModeExplore';
import GameModeTalk from '../mode/talk/GameModeTalk';
import GameModeMenu from '../mode/menu/GameModeMenu';
import GameActionManager from '../action/GameActionManager';
import { Constants } from '../commons/CommonConstants';

export const createGamePhases = () => {
  const gameModeMenu = new GameModeMenu();
  const gameModeTalk = new GameModeTalk();
  const gameModeExplore = new GameModeExplore();
  const gameModeMove = new GameModeMove();

  const gamePhases: GamePhase[] = [
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
      activate: () => GameActionManager.getInstance().createEscapeMenu(),
      deactivate: () => GameActionManager.getInstance().destroyEscapeMenu()
    }
  ];
  return createMapWithKey(gamePhases, 'type') as Map<GamePhaseType, GamePhase>;
};
