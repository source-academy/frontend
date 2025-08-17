import React from 'react';
import { Route } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { SentryRoutes } from 'src/routes/routerConfig';

import { Role } from '../../commons/application/ApplicationTypes';
import NotFound from '../notFound/NotFound';
import AchievementControl from './control/AchievementControl';
import AchievementDashboard from './subcomponents/AchievementDashboard';

const Achievement: React.FC = () => {
  const role = useTypedSelector(state => state.session.role!);

  const toAchievementControl =
    role === Role.Admin || role === Role.Staff ? <AchievementControl /> : <NotFound />;

  return (
    <SentryRoutes>
      <Route path="/" element={<AchievementDashboard />}></Route>
      <Route path="control" element={toAchievementControl}></Route>
      <Route path="*" element={<NotFound />} />
    </SentryRoutes>
  );
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Achievement;
Component.displayName = 'Achievement';

export default Achievement;
