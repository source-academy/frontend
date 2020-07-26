import GameAwardsManager from '../../awards/GameAwardsManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameModeExplore from '../../mode/explore/GameModeExplore';
import GameModeMenu from '../../mode/menu/GameModeMenu';
import GameModeMove from '../../mode/move/GameModeMove';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import GameModeTalk from '../../mode/talk/GameModeTalk';
import { GamePhaseType } from '../../phase/GamePhaseTypes';

/**
 * Game Manager phases, for the phase manager.
 *
 * @param escapeMenu escape menu tied to gameManager
 * @param awardMenu award menu tied to gameManager
 */
export const createGamePhases = (escapeMenu: GameEscapeManager, awardMenu: GameAwardsManager) => {
  return new Map([
    [GamePhaseType.Menu, new GameModeMenu()],
    [GamePhaseType.Move, new GameModeMove()],
    [GamePhaseType.Explore, new GameModeExplore()],
    [GamePhaseType.Talk, new GameModeTalk()],
    [GamePhaseType.Sequence, new GameModeSequence()],
    [GamePhaseType.None, new GameModeSequence()],
    [GamePhaseType.EscapeMenu, escapeMenu],
    [GamePhaseType.AwardMenu, awardMenu]
  ]);
};
