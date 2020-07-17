import React from 'react';

import AchievementLevel from './utils/AchievementLevel';
import { prettifyDate, prettifyWeek } from './utils/DateHelper';
import Inferencer from './utils/Inferencer';

type AchievementOverviewProps = {
  name?: string;
  studio?: string;
  inferencer: Inferencer;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio, inferencer } = props;

  const studentExp = inferencer.getStudentTotalExp();

  const now = new Date();
  const week = prettifyWeek(now);
  const date = prettifyDate(now);

  return (
    <>
      <AchievementLevel studentExp={studentExp} />
      <h3>{name}</h3>
      <h3>{studio}</h3>
      <h3
        style={{ cursor: 'pointer' }}
        onClick={() => window.open('http://www.nus.edu.sg/registrar/info/calendar/AY2020-2021.pdf')}
      >
        {week}
      </h3>
      <h3>{date}</h3>
    </>
  );
}

export default AchievementOverview;
