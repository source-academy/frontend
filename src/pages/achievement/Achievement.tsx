import { Route, Switch } from 'react-router';

import { Role } from '../../commons/application/ApplicationTypes';
import NotFound from '../notFound/NotFound';
import AchievementControl from './control/AchievementControlContainer';
import AchievementDashboard from './subcomponents/AchievementDashboardContainer';

export type DispatchProps = {};

export type StateProps = {
  role: Role;
};

export type AchievementProps = DispatchProps & StateProps;

function Achievement(props: AchievementProps) {
  const { role } = props;

  const toAchievementControl =
    role === Role.Admin || role === Role.Staff ? AchievementControl : NotFound;

  return (
    <Switch>
      <Route
        exact={true}
        path="/courses/:courseId/achievements"
        component={AchievementDashboard}
      ></Route>
      <Route
        path="/courses/:courseId/achievements/control"
        component={toAchievementControl}
      ></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default Achievement;
