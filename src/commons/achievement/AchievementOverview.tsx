import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

import AchievementLevel from './overview/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name } = props;

  const inferencer = useContext(AchievementContext);
  const studentXp = inferencer.getTotalXp();

  return (
    <div className="achievement-overview">
      <AchievementLevel studentXp={studentXp} />
      <h3>{name}</h3>
    </div>
  );
}

export default AchievementOverview;
