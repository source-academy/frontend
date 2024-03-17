import { ProgressBar } from '@blueprintjs/core';
import React, { useState } from 'react';

import { xpPerLevel } from '../../../features/achievement/AchievementConstants';
import Constants from '../../utils/Constants';
import AchievementMilestone from './AchievementMilestone';

type Props = {
  studentXp: number;
};

const AchievementLevel: React.FC<Props> = ({ studentXp }) => {
  const [showMilestone, setShowMilestone] = useState(false);
  const displayMilestone = () => setShowMilestone(true);
  const hideMilestone = () => setShowMilestone(false);

  // start at level 1
  const level = Math.floor(studentXp / xpPerLevel) + 1;
  const progress = studentXp % xpPerLevel;
  const progressFrac = progress / xpPerLevel;

  return (
    <div className="level" onMouseEnter={displayMilestone} onMouseLeave={hideMilestone}>
      <div className="level-badge">
        <span className="level-icon" />
        <p>{`Level ${level}`}</p>
      </div>
      <span className="level-progress">
        <ProgressBar
          animate={false}
          className="progress-bar"
          stripes={false}
          value={progressFrac}
        />
        <p>
          {progress} / {xpPerLevel} XP
        </p>
      </span>
      {Constants.caFulfillmentLevel !== 0 && showMilestone && (
        <AchievementMilestone studentXp={studentXp} />
      )}
    </div>
  );
};

export default AchievementLevel;
