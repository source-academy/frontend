import * as React from 'react';
import {
  createSourceAcademyGame,
  getSourceAcademyGame,
  AccountInfo
} from './subcomponents/sourceAcademyGame';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { resetData } from 'src/features/game/save/GameSaveRequests';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const [isResetThere, setIsResetThere] = React.useState(false);
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  React.useEffect(() => {
    createSourceAcademyGame();
  }, []);

  React.useEffect(() => {
    if (sessionLoaded || !session) {
      return;
    }

    getSourceAcademyGame().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      name: session.name,
      role: session.role
    } as AccountInfo);

    if (session.name === 'Test Student') {
      setIsResetThere(true);
    }

    setSessionLoaded(true);
  }, [sessionLoaded, session]);

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
