import * as React from 'react';

import { fetchAssetPathsLocally } from 'src/features/storySimulator/StorySimulatorService';
import AssetSelection from '../storySimulator/subcomponents/AssetSelection';
import {
  createStorySimulatorGame,
  getStorySimulatorGame
} from './subcomponents/storySimulatorGame';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { AccountInfo } from '../game/subcomponents/sourceAcademyGame';
import CheckpointTxtLoader from './subcomponents/CheckpointTxtLoader';
import AssetViewer from './subcomponents/AssetViewer';

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
      role: session.role
    } as AccountInfo);

    setSessionLoaded(true);
  }, [session, sessionLoaded]);

  return (
    <>
      <div id="game-display">
        <div id="phaser-div" />
      </div>
      <div className="Centered">
        <div className="StorySimulator">
          <CheckpointTxtLoader />
          <div className="AssetPanel">
            <div className="AssetColumn">
              <AssetSelection assetPaths={assetPaths} setCurrentAsset={setCurrentAsset} />
            </div>
            <div className="AssetColumn Centered">
              <AssetViewer assetPath={currentAsset} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StorySimulator;
