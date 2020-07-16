import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Role } from 'src/commons/application/ApplicationTypes';

import AchievementControl from '../academy/achievementControl/AchievementControlContainer';
import Dashboard from './dashboard/DashboardContainer';
import Leaderboard from './leaderboard/LeaderboardContainer';

export type DispatchProps = {};

export type StateProps = {
  role: Role;
};

export type AchievementProps = DispatchProps & StateProps;

function Achievement(props: AchievementProps) {
  const { role } = props;

  const redirectTo404 = () => <Redirect to="/404" />;
  const toAchievementControl =
    role === Role.Admin || role === Role.Staff ? AchievementControl : redirectTo404;

  return (
    <Switch>
      <Route exact={true} path="/achievement" component={Dashboard}></Route>
      <Route path="/achievement/control" component={toAchievementControl}></Route>
      <Route path="/achievement/leaderboard" component={Leaderboard}></Route>
      <Route component={redirectTo404} />
    </Switch>
  );
}

export default Achievement;
