import * as React from 'react';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { resetData } from 'src/features/game/save/GameSaveRequests';

import SourceAcademyGame, {
  AccountInfo,
  createSourceAcademyGame
} from './subcomponents/sourceAcademyGame';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const [isResetThere, setIsResetThere] = React.useState(false);

  React.useEffect(() => {
    createSourceAcademyGame();
    return () => {
      SourceAcademyGame.getInstance().stopAllSounds();
    };
  }, []);

  React.useEffect(() => {
    SourceAcademyGame.getInstance().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      name: session.name,
      role: session.role
    } as AccountInfo);

    if (session.name === 'Test Student') {
      setIsResetThere(true);
    }
  }, [session]);

  return (
    <>
      <div id="game-display"></div>
      {isResetThere && (
        <button
          onClick={async () => {
            await resetData();
          }}
        >
          Reset
        </button>
      )}
    </>
  );
}

export default Game;
