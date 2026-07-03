import { useEffect, useState } from 'react';
import { useAppSelector } from 'src/commons/utils/Hooks';
import type { AccountInfo } from 'src/features/game/SourceAcademyGame';
import SourceAcademyGame, { GameType } from 'src/features/game/SourceAcademyGame';
import { gameSimulatorConfig } from 'src/features/gameSimulator/GameSimulatorConstants';
import { GameSimulatorState } from 'src/features/gameSimulator/GameSimulatorTypes';

import AssetViewer from '../../../features/gameSimulator/subcomponents/assetViewer/AssetViewer';
import ChapterPublisher from '../../../features/gameSimulator/subcomponents/chapterPublisher/ChapterPublisher';
import ChapterSimulator from '../../../features/gameSimulator/subcomponents/chapterSimulator/ChapterSimulator';

const createGameSimulatorGame = () => {
  return new SourceAcademyGame(gameSimulatorConfig, GameType.Simulator);
};

/**
 * This component renders the Main Page of the Game Simulator.
 *
 * It displays the following elements:
 * (1) Game Simulator phaser canvas
 * (2) Game Simulator control panel
 *
 * Game Simulator control panel's content can be altered using
 * `setGameSimulatorState` function. This function is passed into story
 * simulator phaser game, so that the GameSimulatorMenu buttons
 * are able to control what is shown on the Game Simulator panel.
 */
function GameSimulator() {
  const session = useAppSelector(state => state.session);
  const [gameSimulatorState, setGameSimulatorState] = useState<string>(GameSimulatorState.DEFAULT);

  useEffect(() => {
    const game = createGameSimulatorGame();
    game.setGameSimStateSetter(setGameSimulatorState);
    return () => {
      game.isMounted = false;
      game.stopAllSounds();
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    SourceAcademyGame.getInstance().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
      name: session.name,
    } as AccountInfo);
  }, [session]);

  return (
    <div className="GameSimulatorWrapper">
      <div id="game-display" />
      <div className="LeftAlign GameSimulatorPanel">
        {gameSimulatorState === GameSimulatorState.DEFAULT && <h3>Welcome to Game simulator!</h3>}
        {gameSimulatorState === GameSimulatorState.CHAPTERSIMULATOR && <ChapterSimulator />}
        {gameSimulatorState === GameSimulatorState.CHAPTERPUBLISHER && <ChapterPublisher />}
        {gameSimulatorState === GameSimulatorState.ASSETVIEWER && <AssetViewer />}
      </div>
    </div>
  );
}

export const Component = GameSimulator;
