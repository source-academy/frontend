import React from 'react';
import { ProgressBar } from '@blueprintjs/core';

type AchievementLevelProps = {
  studentExp: number;
};

function AchievementLevel(props: AchievementLevelProps) {
  const { studentExp } = props;

  const expPerLevel = 1000;
  const level = Math.floor(studentExp / expPerLevel);
  const progress = studentExp % expPerLevel;
  const progressFrac = progress / expPerLevel;

  return (
    <>
      <h3>{level}</h3>
      <ProgressBar className="progress" value={progressFrac} />
    </>
  );
}

export default AchievementLevel;
