import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { getAchievements, getOwnGoals } from 'src/features/achievement/AchievementActions';
import { saveData } from 'src/features/game/save/GameSaveRequests';
import { FullSaveState } from 'src/features/game/save/GameSaveTypes';
import SourceAcademyGame, {
  AccountInfo,
  createSourceAcademyGame
} from 'src/features/game/SourceAcademyGame';

function Game() {
  const session = useSelector((state: OverallState) => state.session);
  const dispatch = useDispatch();

  const achievements = useSelector((state: OverallState) => state.achievement.achievements);
  const goals = useSelector((state: OverallState) => state.achievement.goals);

  const [isTestStudent, setIsTestStudent] = React.useState(false);
  const [isUsingMock, setIsUsingMock] = React.useState(false);

  React.useEffect(() => {
    dispatch(getAchievements());
    dispatch(getOwnGoals());
  }, [dispatch]);

  React.useEffect(() => {
    const game = createSourceAcademyGame();
    return () => {
      game.isMounted = false;
      game.stopAllSounds();
      game.destroy(true);
    };
  }, []);

  React.useEffect(() => {
    SourceAcademyGame.getInstance().setAccountInfo({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      role: session.role,
      name: session.name
    } as AccountInfo);
    SourceAcademyGame.getInstance().setAchievements(achievements);
    SourceAcademyGame.getInstance().setGoals(goals);

    if (process.env.NODE_ENV === 'development') {
      setIsTestStudent(true);
      setIsUsingMock(true);
      SourceAcademyGame.getInstance().toggleUsingMock(true);
    }
  }, [session, achievements, goals]);

  return (
    <>
      <div id="game-display"></div>
      {isTestStudent && (
        <div className="Horizontal">
          <button
            onClick={async () => {
              await saveData({} as FullSaveState);
              alert('Game cleared! Please refresh');
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
            {isUsingMock ? 'Use Game Chapters' : 'Use Mock Chapters'}
          </button>
        </div>
      )}
    </>
  );
}

export default Game;
