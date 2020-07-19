import { ProgressBar } from '@blueprintjs/core';
import React, { useState } from 'react';

import { expPerLevel } from '../../../../../features/achievement/AchievementConstants';
import AchievementMilestone from './AchievementMilestone';

type AchievementLevelProps = {
  studentExp: number;
};

function AchievementLevel(props: AchievementLevelProps) {
  const { studentExp } = props;

  const [showMilestone, setShowMilestone] = useState<boolean>(false);
  const displayMilestone = () => setShowMilestone(true);
  const hideMilestone = () => setShowMilestone(false);

  const level = Math.floor(studentExp / expPerLevel);
  const progress = studentExp % expPerLevel;
  const progressFrac = progress / expPerLevel;

  return (
    <div className="level">
      <div className="level-badge" onMouseEnter={displayMilestone} onMouseLeave={hideMilestone}>
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
      {showMilestone ? <AchievementMilestone /> : null}
    </div>
  );
}

export default AchievementLevel;
