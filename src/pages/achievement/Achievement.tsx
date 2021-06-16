import { Redirect, Route, Switch } from 'react-router';

import { Role } from '../../commons/application/ApplicationTypes';
import AchievementControl from './control/AchievementControlContainer';
import AchievementDashboard from './subcomponents/AchievementDashboardContainer';

export type DispatchProps = {};

export type StateProps = {
  role: Role;
};

export type AchievementProps = DispatchProps & StateProps;

const redirectTo404 = () => <Redirect to="/404" />;

function Achievement(props: AchievementProps) {
  const { role } = props;

  const toAchievementControl =
    role === Role.Admin || role === Role.Staff ? AchievementControl : redirectTo404;

  return (
    <Switch>
      <Route exact={true} path="/achievements" component={AchievementDashboard}></Route>
      <Route path="/achievements/control" component={toAchievementControl}></Route>
      <Route component={redirectTo404} />
    </Switch>
  );
}

export default Achievement;
