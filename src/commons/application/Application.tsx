import { Button, Classes, Dialog, H4, Intent } from '@blueprintjs/core';
import moment from 'moment';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Academy from '../../pages/academy/Academy';
import Contributors from '../../pages/contributors/Contributors';
import Disabled from '../../pages/disabled/Disabled';
import GitHubClassroom from '../../pages/githubAssessments/GitHubClassroom';
import GitHubCallback from '../../pages/githubCallback/GitHubCallback';
import Login from '../../pages/login/Login';
import MissionControlContainer from '../../pages/missionControl/MissionControlContainer';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/PlaygroundContainer';
import Sicp from '../../pages/sicp/Sicp';
import Welcome from '../../pages/welcome/Welcome';
import { AssessmentType } from '../assessment/AssessmentTypes';
import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { Role } from './ApplicationTypes';
import { UpdateCourseConfiguration, UserCourse } from './types/SessionTypes';

export type ApplicationProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleLogOut: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
  fetchUserAndCourse: () => void;
  handleCreateCourse: (courseConfig: UpdateCourseConfiguration) => void;
  updateCourseResearchAgreement: (agreedToResearch: boolean) => void;
};

export type StateProps = {
  role?: Role;
  name?: string;
  courses: UserCourse[];
  courseId?: number;
  courseShortName?: string;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  assessmentTypes?: AssessmentType[];
  agreedToResearch?: boolean | null;
};

const loginPath = <Route path="/login" component={Login} key="login" />;

const Application: React.FC<ApplicationProps> = props => {
  const intervalId = React.useRef<number | undefined>(undefined);
  const [isDisabled, setIsDisabled] = React.useState(computeDisabledState());
  const isMobile = /iPhone|iPad|Android/.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches; // Checks if user is accessing from the PWA
  const browserDimensions = React.useRef({ height: 0, width: 0 });

  const isLoggedIn = typeof props.name === 'string';
  const isCourseLoaded = isLoggedIn && typeof props.role === 'string';

  // Effect to fetch the latest user info and course configurations from the backend on refresh,
  // if the user was previously logged in
  React.useEffect(() => {
    if (props.name) {
      props.fetchUserAndCourse();
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
    <Route path="/contributors" component={Contributors} key="contributors" />,
    <Route path="/callback/github" component={GitHubCallback} key="githubCallback" />,
    <Redirect
      from="/interactive-sicp/:section?"
      to="/sicpjs/:section?"
      key="oldToNewSicpRedirect"
    />,
    <Route exact path="/sicpjs" key="sicpRedirect">
      <Redirect to="/sicpjs/index" />
    </Route>,
    <Route path="/sicpjs/:section" component={Sicp} key="sicp" />,
    Constants.enableGitHubAssessments ? (
      <Route
        path="/githubassessments"
        render={() => (
          <GitHubClassroom
            handleGitHubLogIn={props.handleGitHubLogIn}
            handleGitHubLogOut={props.handleGitHubLogOut}
          />
        )}
        key="githubAssessments"
      />
    ) : null
  ];

  const isDisabledEffective = !['staff', 'admin'].includes(props.role!) && isDisabled;

  return (
    <div className="Application">
      <NavigationBar
        handleLogOut={props.handleLogOut}
        handleGitHubLogIn={props.handleGitHubLogIn}
        handleGitHubLogOut={props.handleGitHubLogOut}
        handleCreateCourse={props.handleCreateCourse}
        role={props.role}
        name={props.name}
        courses={props.courses}
        courseId={props.courseId}
        courseShortName={props.courseShortName}
        enableAchievements={props.enableAchievements}
        enableSourcecast={props.enableSourcecast}
        assessmentTypes={props.assessmentTypes}
      />
      <div className="Application__main">
        {isDisabledEffective && (
          <Switch>
            {!Constants.playgroundOnly && loginPath}
            {/* if not logged in, and we're not a playground-only deploy, then redirect to login (for staff) */}
            {!isCourseLoaded && !Constants.playgroundOnly
              ? [
                  <Route path="/courses" render={redirectToLogin} key={0} />,
                  <Route exact={true} path="/" render={redirectToLogin} key={1} />
                ]
              : []}
            <Route>
              <Disabled reason={typeof isDisabled === 'string' ? isDisabled : undefined} />
            </Route>
          </Switch>
        )}
        {!isDisabledEffective && Constants.playgroundOnly && (
          <Switch>
            {commonPaths}
            <Route path="/playground" component={Playground} />
            <Route exact={true} path="/">
              <Redirect to="/playground" />
            </Route>
            <Route component={NotFound} />
          </Switch>
        )}
        {!isDisabledEffective && !Constants.playgroundOnly && (
          <Switch>
            {loginPath}
            {commonPaths}
            <Route path={'/courses/:courseId(\\d+)?'} render={toAcademy(props)} />
            <Route path="/welcome" render={ensureUserAndRouteTo(props, <Welcome />)} />
            <Route
              path={'/mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?'}
              component={MissionControlContainer}
            />
            <Route path="/playground" render={ensureUserAndRoleAndRouteTo(props, <Playground />)} />

            <Redirect
              from="/"
              exact={true}
              to={props.courseId != null ? `/courses/${props.courseId}` : '/welcome'}
            />
            {props.courseId != null && [
              <Redirect
                from="/sourcecast/:splat?"
                to={`/courses/${props.courseId}/sourcecast/:splat?`}
                key="legacy-sourcecast"
              />,
              <Redirect
                from="/achievements/:splat?"
                to={`/courses/${props.courseId}/achievements/:splat?`}
                key="legacy-achievements"
              />,
              <Redirect
                from="/academy/:splat?"
                to={`/courses/${props.courseId}/:splat?`}
                key="legacy-academy"
              />
            ]}
            <Route component={NotFound} />
          </Switch>
        )}
      </div>

      {/* agreedToResearch has a default value of undefined in the store.
          It will take on null/true/false when the backend returns. */}
      {Constants.showResearchPrompt && props.agreedToResearch === null && (
        <div className="research-prompt">
          <Dialog
            className={Classes.DARK}
            title="Agreement to Participate in Educational Research"
            canOutsideClickClose={false}
            canEscapeKeyClose={false}
            isCloseButtonShown={false}
            isOpen
          >
            <div className={Classes.DIALOG_BODY}>
              <H4>Welcome to your new Source Academy @ NUS course!</H4>
              <div>
                Here at Source Academy @ NUS, our mission is to bring out the beauty and fun in
                programming and the ideas behind programming, and to make these ideas universally
                accessible. This includes educational research!
              </div>
              <br />
              <div>
                We collect programs that students run in Source Academy @ NUS and store them
                anonymously for our research. You are free to opt out of this collection, with no
                penalty for you whatsoever. Contact your course instructor if you have questions or
                concerns about this research.
              </div>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  text="I would like to opt out"
                  onClick={() => props.updateCourseResearchAgreement(false)}
                />
                <Button
                  text="I consent!"
                  intent={Intent.SUCCESS}
                  onClick={() => props.updateCourseResearchAgreement(true)}
                />
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </div>
  );
};

const redirectToLogin = () => <Redirect to="/login" />;
const redirectToWelcome = () => <Redirect to="/welcome" />;

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = ({ name, role }: ApplicationProps) =>
  name === undefined ? redirectToLogin : role === undefined ? redirectToWelcome : () => <Academy />;

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
