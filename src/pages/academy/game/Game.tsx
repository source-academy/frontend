import * as React from 'react';
import { fetchAssetPaths } from 'src/features/game/GameService';
import game from './subcomponents/phaserGame';
import AssetSelection from './subcomponents/AssetSelection';

function Game() {
  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      const paths = await fetchAssetPaths();
      setAssetPaths(paths);
    })();
  }, []);

  return (
    game && (
      <>
        <div id="game-display">
          <div id="phaser-div" />
        </div>
        {true && (
          <div className="FileMenu">
            <AssetSelection assetPaths={assetPaths} />
          </div>
        )}
      </>
    )
  );
}

export default Game;
