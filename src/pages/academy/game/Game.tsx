import * as React from 'react';
import { fetchAssetPaths } from 'src/features/game/GameService';
import game from './subcomponents/phaserGame';
import AssetSelection from './subcomponents/AssetSelection';
// import StoryChapterSelect from './subcomponents/scenes/StoryChapterSelect';

function Game() {
  const [assetPaths, setAssetPaths] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      const paths = await fetchAssetPaths();
      setAssetPaths(paths);
    })();
  }, []);
  // React.useEffect(() => {
  //   game.sceneAdd(() => console.log('hello'), 'StoryChapterSelect', StoryChapterSelect, true);
  // }, []);

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
