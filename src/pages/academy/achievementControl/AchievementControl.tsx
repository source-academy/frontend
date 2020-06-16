import React from 'react';
import AchievementControlPanel from './subcomponents/AchievementControlPanel';
import AchievementEditor from './subcomponents/AchievementEditor';

import { achievementDict, studentProgress } from '../../../commons/mocks/AchievementMocks';
import { FilterStatus } from '../../../commons/achievements/AchievementTypes';
import { mapAchievementDictToTask } from '../achievements/Achievement';

export type DispatchProps = {};

export type StateProps = {};

function AchievementControl() {
  const achievementTasks = mapAchievementDictToTask(
    achievementDict,
    FilterStatus.ALL,
    studentProgress
  );

  return (
    <div className="AchievementControl">
      <AchievementControlPanel
        achievementDict={achievementDict}
        achievementTasks={achievementTasks}
      />

      <div className="editor-cards">
        <AchievementEditor achievementDict={achievementDict} />
      </div>
    </div>
  );
}

export default AchievementControl;
