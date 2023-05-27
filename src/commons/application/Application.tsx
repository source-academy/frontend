import moment from 'moment';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import Academy from '../../pages/academy/Academy';
import Contributors from '../../pages/contributors/Contributors';
import Disabled from '../../pages/disabled/Disabled';
import GitHubClassroom from '../../pages/githubAssessments/GitHubClassroom';
import GitHubCallback from '../../pages/githubCallback/GitHubCallback';
import Login from '../../pages/login/Login';
import MissionControl from '../../pages/missionControl/MissionControl';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/Playground';
import Sicp from '../../pages/sicp/Sicp';
import Welcome from '../../pages/welcome/Welcome';
import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { useLocalStorageState, useTypedSelector } from '../utils/Hooks';
import { defaultWorkspaceSettings, WorkspaceSettingsContext } from '../WorkspaceSettingsContext';
import { fetchUserAndCourse } from './actions/SessionActions';
import { SessionState } from './types/SessionTypes';

const loginPath = <Route path="/login" element={<Login />} key="login" />;

const Application: React.FC = () => {
  const dispatch = useDispatch();
  const session = useTypedSelector(state => state.session);
  const { role, name, courseId } = session;

  // Used in determining the disabled state of any type of Source Academy deployment (e.g. during exams)
  const intervalId = React.useRef<number | undefined>(undefined);
  const [isDisabled, setIsDisabled] = React.useState(computeDisabledState());

  // Used in the mobile/PWA experience (e.g. separate handling of orientation changes on Andriod & iOS due to unique browser behaviours)
  const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
  const browserDimensions = React.useRef({ height: 0, width: 0 });

  const [workspaceSettings, setWorkspaceSettings] = useLocalStorageState(
    Constants.workspaceSettingsLocalStorageKey,
    defaultWorkspaceSettings
  );

  const isLoggedIn = typeof name === 'string';
  const isCourseLoaded = isLoggedIn && typeof role === 'string';

  // Effect to fetch the latest user info and course configurations from the backend on refresh,
  // if the user was previously logged in
  React.useEffect(() => {
    if (name) {
      dispatch(fetchUserAndCourse());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (Constants.disablePeriods.length > 0) {
      intervalId.current = window.setInterval(() => {
        const disabled = computeDisabledState();
        if (isDisabled !== disabled) {
          setIsDisabled(disabled);
        }
      }, 5000);
    }

    return () => {
      if (intervalId.current) {
        window.clearInterval(intervalId.current);
      }
    };
  }, [isDisabled]);

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

  // Paths common to both deployments
  const commonPaths = [
    <Route path="/contributors" element={<Contributors />} key="contributors" />,
    <Route path="/callback/github" element={<GitHubCallback />} key="githubCallback" />,
    <Route path="/sicpjs/:section?" element={<Sicp />} key="sicp" />,
    Constants.enableGitHubAssessments ? (
      <Route path="/githubassessments" element={<GitHubClassroom />} key="githubAssessments" />
    ) : null
  ];

  const isDisabledEffective = !['staff', 'admin'].includes(role!) && isDisabled;

  const renderDisabled = (
    <Routes>
      {!Constants.playgroundOnly && (
        <>
          {loginPath}
          {/* if not logged in, and we're not a playground-only deploy, then redirect to login (for staff) */}
          {!isCourseLoaded
            ? [
                <Route path="/" element={navigateToLogin} key={0} />,
                <Route path="/courses/*" element={navigateToLogin} key={1} />
              ]
            : []}
        </>
      )}
      <Route>
        <Disabled reason={typeof isDisabled === 'string' ? isDisabled : undefined} />
      </Route>
    </Routes>
  );

  const renderPlaygroundOnly = (
    <Routes>
      {commonPaths}
      <Route path="/" element={<Navigate to="/playground" replace />} />
      <Route path="/playground" element={<Playground />} />
      <Route element={<NotFound />} />
    </Routes>
  );

  const renderFullAcademy = (
    <Routes>
      {loginPath}
      {commonPaths}
      <Route
        path="/"
        element={<Navigate to={courseId != null ? `/courses/${courseId}` : '/welcome'} replace />}
      />
      <Route path="/welcome" element={ensureUserAndRouteTo(session, <Welcome />)} />
      <Route path={'/courses/:courseId(\\d+)?/*'} element={toAcademy(session)} />
      <Route path="/playground" element={ensureUserAndRoleAndRouteTo(session, <Playground />)} />
      <Route
        path={'/mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?'}
        element={<MissionControl />}
      />
      <Route element={<NotFound />} />
    </Routes>
  );

  return (
    <WorkspaceSettingsContext.Provider value={[workspaceSettings, setWorkspaceSettings]}>
      <div className="Application">
        <NavigationBar />
        <div className="Application__main">
          {isDisabledEffective
            ? renderDisabled
            : Constants.playgroundOnly
            ? renderPlaygroundOnly
            : renderFullAcademy}
        </div>
      </div>
    </WorkspaceSettingsContext.Provider>
  );
};

const navigateToLogin = <Navigate to="/login" replace />;
const navigateToWelcome = <Navigate to="/welcome" replace />;

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = ({ name, role }: SessionState) =>
  name === undefined ? navigateToLogin : role === undefined ? navigateToWelcome : <Academy />;

/**
 * Routes a user to the specified route,
 *  1. If the user is logged in, render the specified component
 *  2. If the user is not logged in, redirect to /login
 */
const ensureUserAndRouteTo = ({ name }: SessionState, to: JSX.Element) =>
  name === undefined ? navigateToLogin : to;

/**
 * Routes a user to the specified route,
 *  1. If the user is logged in and has a latest viewed course, render the
 *     specified component
 *  2. If the user is not logged in, redirect to /login
 *  3. If the user is logged in, but does not have a course, redirect to /welcome
 */
const ensureUserAndRoleAndRouteTo = ({ name, role }: SessionState, to: JSX.Element) =>
  name === undefined ? navigateToLogin : role === undefined ? navigateToWelcome : to;

function computeDisabledState() {
  const now = moment();
  for (const { start, end, reason } of Constants.disablePeriods) {
    if (start.isBefore(now) && end.isAfter(now)) {
      return reason || true;
    }
  }
  return false;
}

export default Application;
