import React from 'react';
import Inferencer from './utils/Inferencer';
import AchievementLevel from './utils/AchievementLevel';
import { prettifyDate, prettifyWeek } from './utils/DateHelper';

type AchievementOverviewProps = {
  name?: string;
  studio?: string;
  inferencer: Inferencer;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio, inferencer } = props;

  const studentExp = inferencer.getStudentTotalExp();

  const now = new Date(2020, 7, 31, 1, 0, 0);
  const week = prettifyWeek(now);
  const date = prettifyDate(now);

  return (
    <>
      <AchievementLevel studentExp={studentExp} />
      <h3>{name}</h3>
      <h3>{studio}</h3>
      <h3>{week}</h3>
      <h3>{date}</h3>
    </>
  );
}

export default AchievementOverview;
