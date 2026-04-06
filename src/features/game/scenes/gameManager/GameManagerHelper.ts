import GameModeExplore from '../../mode/explore/GameModeExplore';
import GameModeSequence from '../../mode/sequence/GameModeSequence';
import GameModeTalk from '../../mode/talk/GameModeTalk';
import { GamePhaseType } from '../../phase/GamePhaseTypes';

/**
 * Game Manager phases, for the phase manager.
 */
export const createGamePhases = () => {
  return new Map([
    [GamePhaseType.Explore, new GameModeExplore()],
    [GamePhaseType.Talk, new GameModeTalk()],
    [GamePhaseType.Sequence, new GameModeSequence()],
    [GamePhaseType.None, new GameModeSequence()]
  ]);
};
