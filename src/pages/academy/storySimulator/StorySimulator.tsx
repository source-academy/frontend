import * as React from 'react';
import { Button } from '@blueprintjs/core';

import StorySimulatorAssetSelection from './subcomponents/StorySimulatorAssetSelection';
import StorySimulatorAssetFileUploader from './subcomponents/StorySimulatorAssetFileUploader';
import {
  createStorySimulatorGame,
  getStorySimulatorGame
} from './subcomponents/storySimulatorGame';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { AccountInfo } from '../game/subcomponents/sourceAcademyGame';
import CheckpointTxtLoader from './subcomponents/StorySimulatorCheckpointTxtLoader';
import StorySimulatorAssetViewer from './subcomponents/StorySimulatorAssetViewer';
import { gameTxtStorageName } from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';
import { fetchAssetPaths } from 'src/features/storySimulator/StorySimulatorService';

function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);

  const accessToken = useSelector((state: OverallState) => state.session.accessToken);
  const [fetchToggle, setFetchToggle] = React.useState(false);

  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  const [currentAsset, setCurrentAsset] = React.useState<string>('');

  const [storySimState, setStorySimState] = React.useState<string>('upload');

  React.useEffect(() => {
    createStorySimulatorGame();
    getStorySimulatorGame().setStorySimProps({ setStorySimState });
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
      if (!accessToken) {
        setFetchToggle(!fetchToggle);
        return;
      }
      const paths = await fetchAssetPaths(accessToken);
      if (!paths) {
        setFetchToggle(!fetchToggle);
      }
      setAssetPaths(paths);
    })();
  }, [accessToken, fetchToggle]);

  return (
    <>
      <div className="StorySimulatorWrapper">
        <div id="game-display" />
        <div className="LeftAlign StorySimulatorPanel">
          <h2>Story Simulator</h2>
          {storySimState === 'upload' && (
            <>
              <h3>Checkpoint Text Loader</h3>
              <CheckpointTxtLoader
                title={'Default Chapter'}
                storageName={gameTxtStorageName.defaultChapter}
              />
              <br />
              <CheckpointTxtLoader
                title={'Checkpoint text file'}
                storageName={gameTxtStorageName.checkpointTxt}
              />
              <br />
              <Button onClick={clearSessionStorage}>Clear Browser Files</Button>
            </>
          )}
          {storySimState === 'objectPlacement' && (
            <>
              <h3>Asset Viewer</h3>
              <StorySimulatorAssetViewer assetPath={currentAsset} />
              <h3>Asset Selection</h3>
              <StorySimulatorAssetSelection
                assetPaths={assetPaths}
                setCurrentAsset={setCurrentAsset}
                accessToken={accessToken}
              />
            </>
          )}

          {storySimState === 'assetUploader' && (
            <>
              <h3>Asset uploader</h3>
              <StorySimulatorAssetViewer assetPath={currentAsset} />
              <StorySimulatorAssetFileUploader accessToken={accessToken} />
              <StorySimulatorAssetSelection
                assetPaths={assetPaths}
                setCurrentAsset={setCurrentAsset}
                accessToken={accessToken}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function clearSessionStorage() {
  sessionStorage.setItem(gameTxtStorageName.checkpointTxt, '');
  sessionStorage.setItem(gameTxtStorageName.defaultChapter, '');
}

export default StorySimulator;
