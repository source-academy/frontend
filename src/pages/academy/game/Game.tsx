import * as React from 'react';
import { fetchAssetPaths } from 'src/features/game/GameService';
import game from './subcomponents/phaserGame';
import AssetSelection from './subcomponents/AssetSelection';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import GameManager from '../../../features/game/scenes/gameManager/GameManager';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';

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
    if (!session) {
      return;
    }

    if (sessionLoaded) {
      return;
    }

    game.scene.add('MainMenu', MainMenu, true);
    game.scene.add('ChapterSelect', ChapterSelect, false, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
    game.scene.add('GameManager', GameManager);

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
