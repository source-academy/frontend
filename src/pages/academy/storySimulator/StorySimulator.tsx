import * as React from 'react';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import SourceAcademyGame, { AccountInfo } from 'src/features/game/SourceAcademyGame';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import StorySimulatorAssetFileUploader from './subcomponents/StorySimulatorAssetFileUploader';
import StorySimulatorAssetSelection from './subcomponents/StorySimulatorAssetSelection';
import StorySimulatorChapterSim from './subcomponents/StorySimulatorChapterSim';
import StorySimulatorCheckpointSim from './subcomponents/StorySimulatorCheckpointSim';
import { createStorySimulatorGame } from './subcomponents/storySimulatorGame';

/**
 * Story simulator main page
 *
 * Displays the following elements:
 * (1) Story Simulator phaser canvas
 * (2) Story Simulator control panel
 *
 * Story Simulator control panel's content can be altered using
 * `setStorySimState` function. This function is passed into story
 * simulator phaser game, so that the StorySimulatorMainMenu buttons
 * are able to control what is shown on the Story Simulator panel.
 */
function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);
  const [storySimState, setStorySimState] = React.useState<string>(StorySimState.Default);

  React.useEffect(() => {
    createStorySimulatorGame().setStorySimStateSetter(setStorySimState);
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
    <>
      <div className="StorySimulatorWrapper">
        <div id="game-display" />
        <div className="LeftAlign StorySimulatorPanel">
          {storySimState === StorySimState.Default && (
            <>
              <h3>Welcome to story simulator!</h3>
            </>
          )}
          {storySimState === StorySimState.CheckpointSim && <StorySimulatorCheckpointSim />}
          {storySimState === StorySimState.ObjectPlacement && (
            <>
              <h3>Asset Selection</h3>
              <StorySimulatorAssetSelection />
            </>
          )}
          {storySimState === StorySimState.AssetUploader && (
            <>
              <h3>Asset uploader</h3>
              <StorySimulatorAssetFileUploader />
              <h3>Asset Viewer</h3>
              <StorySimulatorAssetSelection />
            </>
          )}
          {storySimState === StorySimState.ChapterSim && <StorySimulatorChapterSim />}
        </div>
      </div>
    </>
  );
}

export default StorySimulator;
