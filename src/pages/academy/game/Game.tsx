import * as React from 'react';
import { fetchAssetPaths } from 'src/features/game/GameService';
import game, { AccountInfo } from './subcomponents/phaserGame';
import AssetSelection from './subcomponents/AssetSelection';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      const paths = await fetchAssetPaths();
      setAssetPaths(paths);
    })();
  }, []);

  React.useEffect(() => {
    if (!session || sessionLoaded) {
      return;
    }

    game.setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    } as AccountInfo);

    setSessionLoaded(true);
  }, [session, sessionLoaded]);

  return (
    game && (
      <>
        <div id="game-display">
          <div id="phaser-div" />
        </div>
        {false && (
          <div className="Centered">
            <div className="FileMenu">
              <AssetSelection assetPaths={assetPaths} />
            </div>
          </div>
        )}
      </>
    )
  );
}

export default Game;
