import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  getAchievements: () => void;
  getOwnGoals: () => void;
};

export type StateProps = {
  group: string | null;
  inferencer: AchievementInferencer;
  name?: string;
};

/**
 * Generates <AchievementTask /> components
 *
 * @param taskIds an array of achievementId
 * @param filterStatus the dashboard filter status
 * @param focusState the focused achievement state
 */
export const generateAchievementTasks = (
  taskIds: number[],
  filterStatus: FilterStatus,
  focusState: [number, any]
) =>
  taskIds.map(taskId => (
    <AchievementTask key={taskId} id={taskId} filterStatus={filterStatus} focusState={focusState} />
  ));

function Dashboard(props: DispatchProps & StateProps) {
  const { group, getAchievements, getOwnGoals, inferencer, name } = props;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    if (Constants.useAchievementBackend) {
      getAchievements();
      getOwnGoals();
    }
  }, [getAchievements, getOwnGoals]);

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement id that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<number>(NaN);
  const [focusId] = focusState;

  return (
    <AchievementContext.Provider value={inferencer}>
      <div className="AchievementDashboard">
        <AchievementOverview name={name || 'User'} studio={group || 'Staff'} />

        <div className="achievement-main">
          <div className="filter-container">
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.GLOBE}
              ownStatus={FilterStatus.ALL}
            />
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.LOCATE}
              ownStatus={FilterStatus.ACTIVE}
            />
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.ENDORSED}
              ownStatus={FilterStatus.COMPLETED}
            />
          </div>

          <ul className="task-container">
            {generateAchievementTasks(inferencer.listSortedTaskIds(), filterStatus, focusState)}
          </ul>

          <div className="view-container">
            <AchievementView focusId={focusId} />
          </div>
        </div>
      </div>
    </AchievementContext.Provider>
  );
}

export default Dashboard;
