import React from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import SourceAcademyGame, { AccountInfo } from 'src/features/game/SourceAcademyGame';
import { GameSimState } from 'src/features/gameSimulator/GameSimulatorTypes';

import AssetViewer from './subcomponents/assetViewer/AssetViewer';
import ChapterPublisher from './subcomponents/chapterPublisher/ChapterPublisher';
import ChapterSimulator from './subcomponents/chapterSimulator/ChapterSimulator';
import { createGameSimulatorGame } from './subcomponents/GameSimulatorGame';

/**
 * Game simulator main page
 *
 * Displays the following elements:
 * (1) Game Simulator phaser canvas
 * (2) Game Simulator control panel
 *
 * Game Simulator control panel's content can be altered using
 * `setGameSimState` function. This function is passed into story
 * simulator phaser game, so that the GameSimulatorMainMenu buttons
 * are able to control what is shown on the Game Simulator panel.
 */
function GameSimulator() {
  const session = useTypedSelector(state => state.session);
  const [gameSimState, setGameSimState] = React.useState<string>(GameSimState.Default);

  React.useEffect(() => {
    createGameSimulatorGame().setGameSimStateSetter(setGameSimState);
  }, []);

  React.useEffect(() => {
    SourceAcademyGame.getInstance().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
      name: session.name
    } as AccountInfo);
  }, [session]);

  return (
    <div className="GameSimulatorWrapper">
      <div id="game-display" />
      <div className="LeftAlign GameSimulatorPanel">
        {gameSimState === GameSimState.Default && <h3>Welcome to Game simulator!</h3>}
        {gameSimState === GameSimState.CheckpointSim && <ChapterSimulator />}
        {gameSimState === GameSimState.ChapterSim && <ChapterPublisher />}
        {gameSimState === GameSimState.AssetUploader && <AssetViewer />}
      </div>
    </div>
  );
}

export default GameSimulator;
