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
    <div className="level">
      <div className="level-badge">
        <span className="level-icon" />
        <p>{level}</p>
      </div>
      <span className="level-progress">
        <ProgressBar
          className="progress-bar"
          value={progressFrac}
          animate={false}
          stripes={false}
        />
        <p>
          {progress} / {expPerLevel} XP
        </p>
      </span>
    </div>
  );
}

export default AchievementLevel;
