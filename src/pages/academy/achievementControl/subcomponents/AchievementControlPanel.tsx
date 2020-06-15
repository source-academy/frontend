import React from 'react';
import { mapAchievementDictToTask } from '../../achievements/Achievement';
import { achievementDict, studentProgress } from 'src/commons/mocks/AchievementMocks';
import { FilterStatus } from 'src/commons/achievements/AchievementTypes';

type AchievementControlPanelProps = {};

const hack = () => {};

function AchievementControlPanel(props: AchievementControlPanelProps) {
  return (
    <div className="sample-cards">
      <ul className="display-list">
        {mapAchievementDictToTask(achievementDict, FilterStatus.ALL, hack, studentProgress, true)}
      </ul>
    </div>
  );
}

export default AchievementControlPanel;
