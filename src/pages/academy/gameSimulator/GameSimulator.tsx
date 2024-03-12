import React from 'react';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import SourceAcademyGame, { AccountInfo, GameType } from 'src/features/game/SourceAcademyGame';
import { gameSimulatorConfig } from 'src/features/gameSimulator/GameSimulatorConstants';
import GameSimulatorMenu from 'src/features/gameSimulator/GameSimulatorMenu';
import { GameSimulatorState } from 'src/features/gameSimulator/GameSimulatorTypes';

import AssetViewer from './subcomponents/assetViewer/AssetViewer';
import ChapterPublisher from './subcomponents/chapterPublisher/ChapterPublisher';
import ChapterSimulator from './subcomponents/chapterSimulator/ChapterSimulator';

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
const GameSimulator: React.FC = () => {
  const session = useTypedSelector(state => state.session);
  const [gameSimulatorState, setGameSimulatorState] = React.useState<string>(
    GameSimulatorState.DEFAULT
  );

  const createGameSimulatorGame = () => {
    const game = new SourceAcademyGame(gameSimulatorConfig, GameType.Simulator);
    game.scene.add('GameSimulatorMenu', GameSimulatorMenu, true);
    game.scene.add('GameManager', GameManager);
    game.scene.add('CheckpointTransition', CheckpointTransition);
    return game;
  };

  React.useEffect(() => {
    createGameSimulatorGame().setGameSimStateSetter(setGameSimulatorState);
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
        {gameSimulatorState === GameSimulatorState.DEFAULT && <h3>Welcome to Game simulator!</h3>}
        {gameSimulatorState === GameSimulatorState.CHAPTERSIMULATOR && <ChapterSimulator />}
        {gameSimulatorState === GameSimulatorState.CHAPTERPUBLISHER && <ChapterPublisher />}
        {gameSimulatorState === GameSimulatorState.ASSETVIEWER && <AssetViewer />}
      </div>
    </div>
  );
};

export default GameSimulator;
