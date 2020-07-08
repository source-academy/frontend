import React from 'react';
import { prettifyWeek } from './utils/AchievementHints';
import Inferencer from './utils/Inferencer';
import AchievementLevel from './utils/AchievementLevel';

type AchievementOverviewProps = {
  name?: string;
  studio?: string;
  inferencer: Inferencer;
};

// Converts Date to dd/mm/yyyy string format
const prettifyDate = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day + '/' + month + '/' + year;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const { name, studio, inferencer } = props;

  const studentExp = inferencer.getStudentExp();

  const now = new Date();
  const week = prettifyWeek(now);
  const date = prettifyDate(now);

  return (
    <>
      <h3>{name}</h3>
      <h3>{studio}</h3>
      <AchievementLevel studentExp={studentExp} />
      <h3>{week}</h3>
      <h3>{date}</h3>
    </>
  );
}

export default AchievementOverview;
