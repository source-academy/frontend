import { Icon } from '@blueprintjs/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { getAchievements, getOwnGoals } from 'src/features/achievement/AchievementActions';
import { saveData } from 'src/features/game/save/GameSaveRequests';
import { FullSaveState } from 'src/features/game/save/GameSaveTypes';
import SourceAcademyGame, {
  AccountInfo,
  createSourceAcademyGame
} from 'src/features/game/SourceAcademyGame';

function Game() {
  const session = useTypedSelector(state => state.session);
  const dispatch = useDispatch();

  const achievements = useTypedSelector(state => state.achievement.achievements);
  const goals = useTypedSelector(state => state.achievement.goals);

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

  // Logic for the fullscreen button to toggle fullscreen.
  // Entering fullscreen will also lock the screen orientation to landscape.
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const toggleFullScreen = () => {
    const elem = document.getElementById('game-display') as HTMLElement;

    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => {
          if (window.screen.orientation) {
            window.screen.orientation.lock('landscape');
          }
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          if (window.screen.orientation) {
            window.screen.orientation.unlock();
          }
        });
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  // Logic for the fullscreen button to dynamically adjust its size, position and padding
  // based on the size of the game display.
  const [iconSize, setIconSize] = React.useState(0);
  const [iconLeft, setIconLeft] = React.useState('0px');
  const [iconPadding, setIconPadding] = React.useState('0px');
  const gameDisplayRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (gameDisplayRef.current) {
        const aspectRatio = 16 / 9;
        const height = gameDisplayRef.current.offsetHeight;
        const width = gameDisplayRef.current.offsetWidth;
        const size = height / 40;
        const padding = height / 50;
        const leftOffset =
          isFullScreen || height * aspectRatio > width ? 0 : (width - height * aspectRatio) / 2;
        setIconSize(size);
        setIconPadding(`${padding}px`);
        setIconLeft(`${leftOffset}px`);
      }
    };

    // When exiting fullscreen, the browser might not have completed the transition
    // at the time handleResize is called, so the height of gameDisplayRef.current
    // is still the fullscreen height.
    // To fix this, we delay handleResize by 100ms.
    const delayedHandleResize = () => {
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', delayedHandleResize);
    delayedHandleResize();

    return () => window.removeEventListener('resize', delayedHandleResize);
  }, [isFullScreen]);

  return (
    <>
      <div id="game-display" ref={gameDisplayRef}>
        <Icon
          id="fullscreen-button"
          icon={isFullScreen ? 'minimize' : 'fullscreen'}
          color="white"
          htmlTitle={isFullScreen ? 'Exit full screen' : 'Full screen'}
          size={iconSize}
          onClick={toggleFullScreen}
          style={{ left: iconLeft, padding: iconPadding }}
        />
      </div>
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
