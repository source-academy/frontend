import GameModeMove from '../../mode/move/GameModeMove';
import GameModeTalk from '../../mode/talk/GameModeTalk';
import GameModeMenu from '../../mode/menu/GameModeMenu';
import GameModeExplore from '../../mode/explore/GameModeExplore';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import GameCollectiblesManager from '../../collectibles/GameCollectiblesManager';

export const createGamePhases = (
  escapeMenu: GameEscapeManager,
  collectibleMenu: GameCollectiblesManager
) => {
  return new Map([
    [GamePhaseType.Menu, new GameModeMenu()],
    [GamePhaseType.Move, new GameModeMove()],
    [GamePhaseType.Explore, new GameModeExplore()],
    [GamePhaseType.Talk, new GameModeTalk()],
    [GamePhaseType.Sequence, new GameModeSequence()],
    [GamePhaseType.None, new GameModeSequence()],
    [GamePhaseType.EscapeMenu, escapeMenu],
    [GamePhaseType.CollectibleMenu, collectibleMenu]
  ]);
};
