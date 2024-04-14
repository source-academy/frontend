import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useFullscreen } from '@mantine/hooks';
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

  // This is a custom hook imported from @mantine/hooks that handles the fullscreen logic
  // It returns a ref to attach to the element that should be fullscreened,
  // a function to toggle fullscreen and a boolean indicating whether the element is fullscreen
  const {
    ref: fullscreenRef,
    toggle: toggleFullscreen,
    fullscreen: isFullscreen
  } = useFullscreen<HTMLDivElement>();

  // This function is a wrapper around toggleFullscreen that also locks the screen orientation
  // to landscape when entering fullscreen and unlocks it when exiting fullscreen
  const enhancedToggleFullscreen = async () => {
    toggleFullscreen();

    if (window.screen.orientation) {
      if (!isFullscreen) {
        // @ts-expect-error: lock is not defined in the type definition
        // as it is not suppored in some browsers (notably Firefox)
        window.screen.orientation.lock('landscape');
      } else {
        window.screen.orientation.unlock();
      }
    }
  };

  const gameDisplayRef = React.useRef<HTMLDivElement | null>(null);

  // This function sets the gameDisplayRef and also calls the ref callback from useFullscreen
  // to attach the fullscreen logic to the game display element
  const setGameDisplayRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Refs returned by useRef()
      gameDisplayRef.current = node;

      // Ref callback from useFullscreen
      fullscreenRef(node);
    },
    [fullscreenRef]
  );

  // Logic for the fullscreen button to dynamically adjust its size, position and padding
  // based on the size of the game display.
  const [iconSize, setIconSize] = React.useState(0);
  const [iconLeft, setIconLeft] = React.useState('0px');
  const [iconPadding, setIconPadding] = React.useState('0px');

  React.useEffect(() => {
    const handleResize = () => {
      if (gameDisplayRef.current) {
        const aspectRatio = 16 / 9;
        const height = gameDisplayRef.current.offsetHeight;
        const width = gameDisplayRef.current.offsetWidth;
        const size = height / 40;
        const padding = height / 50;
        const leftOffset =
          isFullscreen || height * aspectRatio > width ? 0 : (width - height * aspectRatio) / 2;
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
  }, [isFullscreen]);

  return (
    <>
      <div id="game-display" ref={setGameDisplayRefs}>
        <Icon
          id="fullscreen-button"
          icon={isFullscreen ? IconNames.MINIMIZE : IconNames.FULLSCREEN}
          color="white"
          htmlTitle={isFullscreen ? 'Exit full screen' : 'Full screen'}
          size={iconSize}
          onClick={enhancedToggleFullscreen}
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
