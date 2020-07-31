import React from 'react';

import AchievementInferencer from './utils/AchievementInferencer';
import AchievementLevel from './utils/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
  studio: string;
  inferencer: AchievementInferencer;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio, inferencer } = props;

  const studentExp = inferencer.getStudentTotalExp();

  return (
    <div className="achievement-overview">
      <AchievementLevel studentExp={studentExp} />
      <h3>{name}</h3>
      <h3>{studio}</h3>
    </div>
  );
}

export default AchievementOverview;
