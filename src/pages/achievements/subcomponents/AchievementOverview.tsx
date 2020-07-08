import React from 'react';
import { prettifyWeek } from './utils/AchievementHints';
import Inferencer from './utils/Inferencer';

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

  const expPerLevel = 1000;

  const studentExp = inferencer.getStudentExp();
  const totalExp = inferencer.getTotalExp();
  const level = Math.floor(studentExp / expPerLevel);

  const now = new Date(2020, 8, 20, 1, 0, 0);
  const week = prettifyWeek(now);
  const date = prettifyDate(now);

  return (
    <div>
      <h2>{name}</h2>
      <h2>{studio}</h2>
      <h2>{level}</h2>
      <h2>
        {studentExp} / {totalExp}
      </h2>
      <h1>{week}</h1>
      <h1>{date}</h1>
    </div>
  );
}

export default AchievementOverview;
