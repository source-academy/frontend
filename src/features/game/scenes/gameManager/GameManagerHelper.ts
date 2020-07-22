import GameModeExplore from '../../mode/explore/GameModeExplore';
import GameModeMenu from '../../mode/menu/GameModeMenu';
import GameModeMove from '../../mode/move/GameModeMove';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import GameModeTalk from '../../mode/talk/GameModeTalk';
import { GamePhaseType } from '../../phase/GamePhaseTypes';

/**
 * Game Manager phases, for the phase manager.
 */
export const createGamePhases = () => {
  return new Map([
    [GamePhaseType.Menu, new GameModeMenu()],
    [GamePhaseType.Move, new GameModeMove()],
    [GamePhaseType.Explore, new GameModeExplore()],
    [GamePhaseType.Talk, new GameModeTalk()],
    [GamePhaseType.Sequence, new GameModeSequence()],
    [GamePhaseType.None, new GameModeSequence()]
  ]);
};
