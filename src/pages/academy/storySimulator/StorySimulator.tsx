import * as React from 'react';

import { fetchAssetPathsLocally } from 'src/features/storySimulator/StorySimulatorService';
import StorySimulatorAssetSelection from './subcomponents/StorySimulatorAssetSelection';
import {
  createStorySimulatorGame,
  getStorySimulatorGame
} from './subcomponents/storySimulatorGame';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { AccountInfo } from '../game/subcomponents/sourceAcademyGame';
import CheckpointTxtLoader from './subcomponents/StorySimulatorCheckpointTxtLoader';
import AssetViewer from './subcomponents/StorySimulatorAssetViewer';
import { gameTxtStorageName } from 'src/features/storySimulator/scenes/mainMenu/MainMenuConstants';

function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  const [currentAsset, setCurrentAsset] = React.useState<string>('');

  React.useEffect(() => {
    createStorySimulatorGame();
    (async () => {
      const paths = await fetchAssetPathsLocally();
      setAssetPaths(paths);
    })();
  }, []);

  React.useEffect(() => {
    if (sessionLoaded || !session) {
      return;
    }

    getStorySimulatorGame().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
      name: session.name
    } as AccountInfo);

    setSessionLoaded(true);
  }, [session, sessionLoaded]);

  return (
    <>
      <div className="StorySimulatorWrapper">
        <div id="game-display" />
        <div className="LeftAlign StorySimulatorPanel">
          <h2>StorySimulator</h2>
          <h3>Checkpoint Text Loader</h3>
          <CheckpointTxtLoader
            title={'Default Chapter'}
            storageName={gameTxtStorageName.defaultChapter}
            clearStorage={true}
          />
          <br />
          <CheckpointTxtLoader
            title={'Checkpoint text file'}
            storageName={gameTxtStorageName.checkpointTxt}
            clearStorage={false}
          />
          <h3>Asset Viewer</h3>
          <AssetViewer assetPath={currentAsset} />
          <h3>Asset Selection</h3>
          <StorySimulatorAssetSelection assetPaths={assetPaths} setCurrentAsset={setCurrentAsset} />
        </div>
      </div>
    </>
  );
}

export default StorySimulator;
