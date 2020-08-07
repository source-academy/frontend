import React, { useState } from 'react';
import { FilterStatus } from 'src/features/achievement/AchievementTypes';
import { generateAchievementTasks } from 'src/pages/achievement/subcomponents/AchievementDashboard';

import AchievementInferencer from '../utils/AchievementInferencer';

type AchievementPreviewProps = {
  inferencer: AchievementInferencer;
};

function AchievementPreview(props: AchievementPreviewProps) {
  const { inferencer } = props;

  // If an achievement is focused, the cards glow and dashboard displays the AchievementView
  const focusState = useState<number>(-1);

  return (
    <div className="achievement-preview">
      <div className="title">
        <h1>Achievement Preview</h1>
      </div>
      <ul className="task-container">
        {generateAchievementTasks(inferencer, FilterStatus.ALL, focusState)}
      </ul>
    </div>
  );
}

export default AchievementPreview;
