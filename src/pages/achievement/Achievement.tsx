import React from 'react';
import { Route, Switch } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import { Role } from '../../commons/application/ApplicationTypes';
import NotFound from '../notFound/NotFound';
import AchievementControl from './control/AchievementControlContainer';
import AchievementDashboard from './subcomponents/AchievementDashboardContainer';

const Achievement: React.FC = () => {
  const role = useTypedSelector(state => state.session.role!);

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
};

export default Achievement;
