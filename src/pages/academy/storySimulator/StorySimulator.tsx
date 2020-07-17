import * as React from 'react';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import SourceAcademyGame, { AccountInfo } from 'src/features/game/SourceAcademyGame';
import { fetchAssetPaths, s3AssetFolders } from 'src/features/storySimulator/StorySimulatorService';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import StorySimulatorAssetFileUploader from './subcomponents/StorySimulatorAssetFileUploader';
import StorySimulatorAssetSelection from './subcomponents/StorySimulatorAssetSelection';
import StorySimulatorChapterSim from './subcomponents/StorySimulatorChapterSim';
import StorySimulatorCheckpointSim from './subcomponents/StorySimulatorCheckpointSim';
import { createStorySimulatorGame } from './subcomponents/storySimulatorGame';

function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);
  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  const [storySimState, setStorySimState] = React.useState<string>(StorySimState.Default);

  React.useEffect(() => {
    createStorySimulatorGame().setStorySimStateSetter(setStorySimState);
  }, []);

  React.useEffect(() => {
    (async () => {
      SourceAcademyGame.getInstance().setAccountInfo(session as AccountInfo);
      setAssetPaths(await fetchAssetPaths(s3AssetFolders));
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
            <StorySimulatorCheckpointSim assetPaths={assetPaths} />
          )}
          {storySimState === StorySimState.ObjectPlacement && (
            <>
              <h3>Asset Selection</h3>
              <StorySimulatorAssetSelection assetPaths={assetPaths} />
            </>
          )}
          {storySimState === StorySimState.AssetUploader && (
            <>
              <h3>Asset uploader</h3>
              <StorySimulatorAssetFileUploader />
              <h3>Asset Viewer</h3>
              <StorySimulatorAssetSelection assetPaths={assetPaths} />
            </>
          )}
          {storySimState === StorySimState.ChapterSim && (
            <StorySimulatorChapterSim allCheckpointFilenames={assetPaths} />
          )}
        </div>
      </div>
    </>
  );
}

export default StorySimulator;
