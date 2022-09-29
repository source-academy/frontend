import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import AchievementLevel from './overview/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name } = props;

  const studentXp = useSelector((store: OverallState) => store.session.xp);

  return (
    <div className="achievement-overview">
      <AchievementLevel studentXp={studentXp} />
      <h3>{name}</h3>
    </div>
  );
}

export default AchievementOverview;
