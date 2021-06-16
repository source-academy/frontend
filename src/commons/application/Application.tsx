import moment from 'moment';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Academy from '../../pages/academy/AcademyContainer';
import Achievement from '../../pages/achievement/AchievementContainer';
import Contributors from '../../pages/contributors/Contributors';
import Disabled from '../../pages/disabled/Disabled';
import GitHubAssessmentWorkspaceContainer from '../../pages/githubAssessments/GitHubAssessmentWorkspaceContainer';
import GitHubMissionListing from '../../pages/githubAssessments/GitHubMissionListing';
import GitHubCallback from '../../pages/githubCallback/GitHubCallback';
import Login from '../../pages/login/LoginContainer';
import MissionControlContainer from '../../pages/missionControl/MissionControlContainer';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/PlaygroundContainer';
import Sicp from '../../pages/sicp/Sicp';
import Sourcecast from '../../pages/sourcecast/SourcecastContainer';
import Welcome from '../../pages/welcome/WelcomeContainer';
import { AssessmentType } from '../assessment/AssessmentTypes';
import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { parseQuery } from '../utils/QueryHelper';
import { Role } from './ApplicationTypes';
import { UserCourse } from './types/SessionTypes';

export type ApplicationProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleLogOut: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  updateLatestViewedCourse: (courseId: number) => void;
};

export type StateProps = {
  role?: Role;
  name?: string;
  courses: UserCourse[];
  courseShortname?: string;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes: AssessmentType[];
};

const Application: React.FC<ApplicationProps> = props => {
  const intervalId = React.useRef<number | undefined>(undefined);
  const [isDisabled, setIsDisabled] = React.useState(computeDisabledState());
  const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
  const browserDimensions = React.useRef({ height: 0, width: 0 });

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

  const loginPath = <Route path="/login" render={toLogin(props)} key="login" />;

  const githubAssessmentsPaths = Constants.enableGitHubAssessments
    ? [
        <Route
          path="/githubassessments/missions"
          component={() => (
            <GitHubMissionListing
              handleGitHubLogIn={props.handleGitHubLogIn}
              handleGitHubLogOut={props.handleGitHubLogOut}
            />
          )}
          key="githubAssessmentsMissions"
        />,
        <Route
          path="/githubassessments/editor"
          component={GitHubAssessmentWorkspaceContainer}
          key="githubAssessmentsEditor"
        />
      ]
    : [];

  // Paths for the playground-only deployment
  const playgroundOnlyPaths = [
    <Route path="/playground" component={Playground} key="playground" />,
    <Route path="/contributors" component={Contributors} key="contributors" />,
    <Route path="/callback/github" component={GitHubCallback} key="githubCallback" />,
    <Route exact path="/interactive-sicp" render={redirectToSicp} key="sicpRedirect" />,
    <Route path="/interactive-sicp/:section" component={Sicp} key="sicp" />,
    ...githubAssessmentsPaths
  ];

  // Paths for the Source Academy @NUS deployment
  const fullPaths = [
    loginPath,
    <Route
      path="/playground"
      render={ensureUserAndRouteTo(props, <Playground />)}
      key="authPlayground"
    />,
    ...playgroundOnlyPaths,
    <Route path="/academy" render={toAcademy(props)} key="academy" />,
    <Route path="/welcome" render={ensureUserAndRouteTo(props, <Welcome />)} key="welcome" />
  ];

  if (props.role && props.role !== 'student') {
    fullPaths.push(
      <Route
        path={'/mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?'}
        render={toIncubator}
        key="missionControl"
      />
    );
  }

  if (props.enableSourcecast) {
    fullPaths.push(
      <Route
        path="/sourcecast/:sourcecastId?"
        render={ensureUserAndRoleAndRouteTo(props, <Sourcecast />)}
        key="sourcecast"
      />
    );
  }
  if (props.enableAchievements) {
    fullPaths.push(
      <Route
        path="/achievements"
        render={ensureUserAndRoleAndRouteTo(props, <Achievement />)}
        key="achievements"
      />
    );
  }

  const disabled = !['staff', 'admin'].includes(props.role!) && isDisabled;

  const renderDisabled = () => (
    <Disabled reason={typeof isDisabled === 'string' ? isDisabled : undefined} />
  );

  return (
    <div className="Application">
      <NavigationBar
        handleLogOut={props.handleLogOut}
        handleGitHubLogIn={props.handleGitHubLogIn}
        handleGitHubLogOut={props.handleGitHubLogOut}
        updateLatestViewedCourse={props.updateLatestViewedCourse}
        role={props.role}
        name={props.name}
        courses={props.courses}
        courseShortname={props.courseShortname}
        enableAchievements={props.enableAchievements}
        enableSourcecast={props.enableSourcecast}
        assessmentTypes={props.assessmentTypes}
      />
      <div className="Application__main">
        {disabled && (
          <Switch>
            {!Constants.playgroundOnly && loginPath}
            {/* if not logged in, and we're not a playground-only deploy, then redirect to login (for staff) */}
            {!props.role && !Constants.playgroundOnly
              ? [
                  <Route path="/academy" render={redirectToLogin} key={0} />,
                  <Route exact={true} path="/" render={redirectToLogin} key={1} />
                ]
              : []}
            <Route render={renderDisabled} />
          </Switch>
        )}
        {!disabled && Constants.playgroundOnly && (
          <Switch>
            {playgroundOnlyPaths}
            <Route exact={true} path="/" render={redirectToPlayground} />
            <Route component={NotFound} />
          </Switch>
        )}
        {!disabled && !Constants.playgroundOnly && (
          <Switch>
            {fullPaths}
            <Route exact={true} path="/" render={redirectToAcademy} />
            <Route component={NotFound} />
          </Switch>
        )}
      </div>
    </div>
  );
};

const redirectToPlayground = () => <Redirect to="/playground" />;
const redirectToAcademy = () => <Redirect to="/academy" />;
const redirectToLogin = () => <Redirect to="/login" />;
const redirectToWelcome = () => <Redirect to="/welcome" />;
const redirectToSicp = () => <Redirect to="/interactive-sicp/index" />;

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = ({ name, role }: ApplicationProps) =>
  name === undefined
    ? redirectToLogin
    : role === undefined
    ? redirectToWelcome
    : () => <Academy role={role} />;

/**
 * Routes a user to the specified route,
 *  1. If the user is logged in, render the specified component
 *  2. If the user is not logged in, redirect to /login
 */
const ensureUserAndRouteTo = ({ name }: ApplicationProps, to: JSX.Element) =>
  name === undefined ? redirectToLogin : () => to;

/**
 * Routes a user to the specified route,
 *  1. If the user is logged in and has a latest viewed course, render the
 *     specified component
 *  2. If the user is not logged in, redirect to /login
 *  3. If the user is logged in, but does not have a course, redirect to /welcome
 */
const ensureUserAndRoleAndRouteTo = ({ name, role }: ApplicationProps, to: JSX.Element) =>
  name === undefined ? redirectToLogin : role === undefined ? redirectToWelcome : () => to;

const toLogin = (props: ApplicationProps) => () => {
  const qstr = parseQuery(props.location.search);

  return (
    <Login
      code={qstr.code}
      providerId={qstr.provider}
      providers={[...Constants.authProviders.entries()].map(([id, { name }]) => ({
        id,
        name
      }))}
    />
  );
};

const toIncubator = () => <MissionControlContainer />;

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
