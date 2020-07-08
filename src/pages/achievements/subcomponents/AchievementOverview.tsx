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
    <>
      <h3>{name}</h3>
      <h3>{studio}</h3>
      <h3>{level}</h3>
      <h3>
        {studentExp} / {totalExp}
      </h3>
      <h3>{week}</h3>
      <h3>{date}</h3>
    </>
  );
}

export default AchievementOverview;
