import React from 'react';

import AchievementInferencer from './utils/AchievementInferencer';
import AchievementLevel from './utils/AchievementLevel';
import { prettifyDate } from './utils/DateHelper';

type AchievementOverviewProps = {
  name?: string;
  studio?: string;
  inferencer: AchievementInferencer;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio, inferencer } = props;

  const studentExp = inferencer.getStudentTotalExp();

  const now = new Date();
  const date = prettifyDate(now);

  return (
    <>
      <AchievementLevel studentExp={studentExp} />
      <h3>{name}</h3>
      <h3>{studio}</h3>
      <h3>{date}</h3>
    </>
  );
}

export default AchievementOverview;
