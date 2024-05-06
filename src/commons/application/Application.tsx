import React from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';

import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { useLocalStorageState, useSession } from '../utils/Hooks';
import { defaultWorkspaceSettings, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import SessionActions from './actions/SessionActions';

const Application: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSession();

  // Used in the mobile/PWA experience (e.g. separate handling of orientation changes on Andriod & iOS due to unique browser behaviours)
  const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
  const browserDimensions = React.useRef({ height: 0, width: 0 });

  const [workspaceSettings, setWorkspaceSettings] = useLocalStorageState(
    Constants.workspaceSettingsLocalStorageKey,
    defaultWorkspaceSettings
  );

  // Effect to fetch the latest user info and course configurations from the backend on refresh,
  // if the user was previously logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      dispatch(SessionActions.fetchUserAndCourse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The following effect prevents the mobile browser interface from hiding on scroll by setting the
   * application height to the window's innerHeight, even after orientation changes. This ensures that
   * the app UI does not break due to the hiding of the browser interface when the user is not on the PWA.
   *
   * Note: When the soft keyboard is up on Android devices, the viewport height decreases and triggers
   * the 'resize' event. The conditional in orientationChangeHandler checks specifically for this, and
   * does not update the application height when the Android keyboard triggers the resize event. IOS
   * devices are not affected.
   */
  React.useEffect(() => {
    const orientationChangeHandler = () => {
      if (
        !(
          window.innerHeight < browserDimensions.current.height &&
          window.innerWidth === browserDimensions.current.width
        )
      ) {
        // If it is not an Android soft keyboard triggering the resize event, update the application height.
        document.documentElement.style.setProperty(
          '--application-height',
          window.innerHeight + 'px'
        );
      }
      browserDimensions.current = { height: window.innerHeight, width: window.innerWidth };
    };

    if (!isPWA && isMobile) {
      orientationChangeHandler();
      window.addEventListener('resize', orientationChangeHandler);
    }

    return () => {
      if (!isPWA && isMobile) {
        window.removeEventListener('resize', orientationChangeHandler);
      }
    };
  }, [isPWA, isMobile]);

  return (
    <WorkspaceSettingsContext.Provider value={[workspaceSettings, setWorkspaceSettings]}>
      <div className="Application">
        <NavigationBar />
        <div className="Application__main">
          <Outlet />
        </div>
      </div>
    </WorkspaceSettingsContext.Provider>
  );
};

export default Application;
