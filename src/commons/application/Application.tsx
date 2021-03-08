import moment from 'moment';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import Achievement from 'src/pages/achievement/AchievementContainer';

import Academy from '../../pages/academy/AcademyContainer';
import Contributors from '../../pages/contributors/Contributors';
import Disabled from '../../pages/disabled/Disabled';
import Login from '../../pages/login/LoginContainer';
import MissionControlContainer from '../../pages/missionControl/MissionControlContainer';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/PlaygroundContainer';
import SourcecastContainer from '../../pages/sourcecast/SourcecastContainer';
import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { parseQuery } from '../utils/QueryHelper';
import { Role } from './ApplicationTypes';

export type ApplicationProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleLogOut: () => void;
};

export type StateProps = {
  role?: Role;
  title: string;
  name?: string;
};

const Application: React.FC<ApplicationProps> = props => {
  const intervalId = React.useRef<number | undefined>(undefined);
  const [isDisabled, setIsDisabled] = React.useState(computeDisabledState());

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

  const loginPath = <Route path="/login" render={toLogin(props)} key="login" />;
  const fullPaths = Constants.playgroundOnly
    ? null
    : [
        <Route path="/academy" render={toAcademy(props)} key={0} />,
        <Route
          path={'/mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?'}
          render={toIncubator}
          key={1}
        />,
        <Route path="/achievement" render={toAchievement(props)} key={2} />,
        loginPath
      ];
  const disabled = !['staff', 'admin'].includes(props.role!) && isDisabled;

  const renderDisabled = () => (
    <Disabled reason={typeof isDisabled === 'string' ? isDisabled : undefined} />
  );

  return (
    <div className="Application">
      <NavigationBar
        handleLogOut={props.handleLogOut}
        role={props.role}
        name={props.name}
        title={props.title}
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
        {!disabled && (
          <Switch>
            <Route path="/playground" component={Playground} />
            <Route path="/contributors" component={Contributors} />
            <Route path="/sourcecast/:sourcecastId?" component={SourcecastContainer} />
            {fullPaths}
            <Route
              exact={true}
              path="/"
              render={Constants.playgroundOnly ? redirectToPlayground : redirectToAcademy}
            />
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

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = ({ role }: ApplicationProps) =>
  role === undefined ? redirectToLogin : () => <Academy role={role} />;

/**
 * A user routes to /achievement,
 *  1. If the user is logged in, render the Achievement component
 *  2. If the user is not logged in, redirect to /login
 */
const toAchievement = ({ role }: ApplicationProps) =>
  role === undefined ? redirectToLogin : () => <Achievement />;

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
