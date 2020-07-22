import * as React from 'react';
import { useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { clearData } from 'src/features/game/save/GameSaveRequests';
import SourceAcademyGame, {
  AccountInfo,
  createSourceAcademyGame
} from 'src/features/game/SourceAcademyGame';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const [isTestStudent, setIsTestStudent] = React.useState(false);
  const [isUsingMock, setIsUsingMock] = React.useState(false);

  React.useEffect(() => {
    createSourceAcademyGame();
    return () => {
      SourceAcademyGame.getInstance().isMounted = false;
      SourceAcademyGame.getInstance().stopAllSounds();
    };
  }, []);

  React.useEffect(() => {
    SourceAcademyGame.getInstance().setAccountInfo(session as AccountInfo);
    if (session.name === 'Test Student') {
      setIsTestStudent(true);
      setIsUsingMock(true);
      SourceAcademyGame.getInstance().toggleUsingMock();
    }
  }, [session]);

  return (
    <>
      <div id="game-display"></div>
      {isTestStudent && (
        <div className="Horizontal">
          <button
            onClick={async () => {
              await clearData();
            }}
          >
            Clear data
          </button>
          <button
            onClick={() => {
              setIsUsingMock(!isUsingMock);
              SourceAcademyGame.getInstance().toggleUsingMock();
            }}
          >
            {isUsingMock ? 'Use Actual' : 'Use Mocks'}
          </button>
        </div>
      )}
    </>
  );
}

export default Game;
