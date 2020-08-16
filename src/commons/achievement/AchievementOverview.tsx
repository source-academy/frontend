import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import AchievementLevel from './overview/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
  studio: string;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio } = props;

  const inferencer = useContext(AchievementContext);
  const studentXp = inferencer.getTotalXp();

  return (
    <div className="achievement-overview">
      <AchievementLevel studentXp={studentXp} />
      <h3>{name}</h3>
      <h3>{studio}</h3>
    </div>
  );
}

export default AchievementOverview;
