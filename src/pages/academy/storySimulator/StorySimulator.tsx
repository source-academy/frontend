import * as React from 'react';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { fetchAssetPaths, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import { AccountInfo } from '../game/subcomponents/sourceAcademyGame';
import StorySimulatorAssetFileUploader from './subcomponents/StorySimulatorAssetFileUploader';
import StorySimulatorAssetSelection from './subcomponents/StorySimulatorAssetSelection';
import StorySimulatorChapterSequencer from './subcomponents/StorySimulatorChapterSequencer';
import StorySimulatorCheckpointSim from './subcomponents/StorySimulatorCheckpointSim';
import {
  createStorySimulatorGame,
  getStorySimulatorGame
} from './subcomponents/storySimulatorGame';

function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);

  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  const [storySimState, setStorySimState] = React.useState<string>(StorySimState.Default);

  React.useEffect(() => {
    createStorySimulatorGame().setStorySimProps({ setStorySimState });
  }, []);

  React.useEffect(() => {
    getStorySimulatorGame().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
      name: session.name
    } as AccountInfo);
  }, [session]);

  React.useEffect(() => {
    (async () => {
      setAssetPaths(await fetchAssetPaths(session.accessToken, s3AssetFolders));
    })();
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
          {storySimState === StorySimState.CheckpointSim && (
            <StorySimulatorCheckpointSim
              accessToken={session.accessToken}
              assetPaths={assetPaths}
            />
          )}
          {storySimState === StorySimState.ObjectPlacement && (
            <>
              <h3>Asset Selection</h3>
              <StorySimulatorAssetSelection
                folders={s3AssetFolders}
                assetPaths={assetPaths}
                accessToken={session.accessToken}
              />
            </>
          )}
          {storySimState === StorySimState.AssetUploader && (
            <>
              <h3>Asset uploader</h3>
              <StorySimulatorAssetFileUploader accessToken={session.accessToken} />
              <h3>Asset Viewer</h3>
              <StorySimulatorAssetSelection
                folders={s3AssetFolders}
                assetPaths={assetPaths}
                accessToken={session.accessToken}
              />
            </>
          )}
          {storySimState === StorySimState.ChapterSequence && <StorySimulatorChapterSequencer />}
        </div>
      </div>
    </>
  );
}

export default StorySimulator;
