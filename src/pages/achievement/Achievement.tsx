import React from 'react';
import { Route, Routes } from 'react-router';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import { Role } from '../../commons/application/ApplicationTypes';
import NotFound from '../notFound/NotFound';
import AchievementControl from './control/AchievementControlContainer';
import AchievementDashboard from './subcomponents/AchievementDashboardContainer';

const Achievement: React.FC = () => {
  const role = useTypedSelector(state => state.session.role!);

  const toAchievementControl =
    role === Role.Admin || role === Role.Staff ? <AchievementControl /> : <NotFound />;

  return (
    <Routes>
      <Route path="/" element={<AchievementDashboard />}></Route>
      <Route path="control" element={toAchievementControl}></Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Achievement;
