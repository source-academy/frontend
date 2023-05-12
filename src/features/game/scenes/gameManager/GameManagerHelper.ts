import GameModeExplore from 'src/features/game/mode/explore/GameModeExplore';
import GameModeMenu from 'src/features/game/mode/menu/GameModeMenu';
import GameModeMove from 'src/features/game/mode/move/GameModeMove';
import GameModeSequence from 'src/features/game/mode/sequence/GameModeSequence';
import GameModeTalk from 'src/features/game/mode/talk/GameModeTalk';
import { GamePhaseType } from 'src/features/game/phase/GamePhaseTypes';

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
