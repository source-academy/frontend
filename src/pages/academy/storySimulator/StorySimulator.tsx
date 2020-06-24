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
import StoryXmlLoader from './subcomponents/StoryXmlLoader';
import AssetViewer from './subcomponents/AssetViewer';

function StorySimulator() {
  const session = useSelector((state: OverallState) => state.session);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  const [currentAsset, setCurrentAsset] = React.useState<string>('');

  React.useEffect(() => {
    (async () => {
      const paths = await fetchAssetPathsLocally();
      setAssetPaths(paths);
    })();
  }, []);

  React.useEffect(() => {
    createStorySimulatorGame();
  }, []);

  React.useEffect(() => {
    if (sessionLoaded || !session) {
      return;
    }

    getStorySimulatorGame().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
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
          <StoryXmlLoader />
          <div className="Horizontal">
            <div className="FileMenu">
              <AssetSelection assetPaths={assetPaths} setCurrentAsset={setCurrentAsset} />
            </div>
            <div>
              <AssetViewer assetPath={currentAsset} />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="ContentDisplay row center-xs ">
        <div className="col-xs-10 contentdisplay-content-parent">
          <div className="WhiteBackground VerticalStack">
            <h2>Story Simulator</h2>
           

            <div className="Horizontal">
              <div className="Column">
                <StoryXmlLoader />
              </div>
              <div className="Column">
                <JsonUpload />
              </div>
            </div>

            <div>
              <h3>XML to be loaded</h3>
              {'mission-1'}
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default StorySimulator;
