import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { FilterStatus } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  handleGetAchievements: () => void;
  // TODO: handleGetGoals: () => void;
  // TODO: handleGetOwnGoals: () => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
  name?: string;
  group: string | null;
};

/**
 * Generates <AchievementTask /> components
 *
 * @param taskIds an array of achievementId
 */
export const generateAchievementTasks = (
  inferencer: AchievementInferencer,
  filterStatus: FilterStatus,
  focusState: [number, any]
) => {
  const taskIds = inferencer.listTaskIdsbyPosition();
  return taskIds.map(taskId => (
    <AchievementTask
      key={taskId}
      id={taskId}
      inferencer={inferencer}
      filterStatus={filterStatus}
      focusState={focusState}
    />
  ));
};

function Dashboard(props: DispatchProps & StateProps) {
  const { inferencer, name, group, handleGetAchievements } = props;

  useEffect(() => {
    if (Constants.useBackend) {
      handleGetAchievements();
      // TODO: handleGetGoals();
    }
  }, [handleGetAchievements]);

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  // If an achievement is focused, the cards glow and dashboard displays the AchievementView
  const focusState = useState<number>(-1);
  const [focusId] = focusState;

  return (
    <div className="AchievementDashboard">
      <AchievementOverview
        name={name || 'User'}
        studio={group || 'Staff'}
        inferencer={inferencer}
      />

      <div className="achievement-main">
        <div className="filter-container">
          <AchievementFilter
            ownStatus={FilterStatus.ALL}
            icon={IconNames.GLOBE}
            filterState={filterState}
          />
          <AchievementFilter
            ownStatus={FilterStatus.ACTIVE}
            icon={IconNames.LOCATE}
            filterState={filterState}
          />
          <AchievementFilter
            ownStatus={FilterStatus.COMPLETED}
            icon={IconNames.ENDORSED}
            filterState={filterState}
          />
        </div>

        <ul className="task-container">
          {generateAchievementTasks(inferencer, filterStatus, focusState)}
        </ul>

        <div className="view-container">
          <AchievementView inferencer={inferencer} focusId={focusId} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
