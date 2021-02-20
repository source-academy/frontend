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
 * @param taskUuids an array of achievementUuid
 * @param filterStatus the dashboard filter status
 * @param focusState the focused achievement state
 */
export const generateAchievementTasks = (
  taskUuids: string[],
  filterStatus: FilterStatus,
  focusState: [string, any]
) =>
  taskUuids.map(taskUuid => (
    <AchievementTask key={taskUuid} uuid={taskUuid} filterStatus={filterStatus} focusState={focusState} />
  ));

function Dashboard(props: DispatchProps & StateProps) {
  const { group, getAchievements, getOwnGoals, inferencer, name } = props;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    if (Constants.useAchievementBackend) {
      getOwnGoals();
      getAchievements();
    }
  }, [getAchievements, getOwnGoals]);

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<string>('');
  const [focusUuid] = focusState;

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
            {generateAchievementTasks(inferencer.listSortedTaskUuids(), filterStatus, focusState)}
          </ul>

          <div className="view-container">
            <AchievementView focusUuid={focusUuid} />
          </div>
        </div>
      </div>
    </AchievementContext.Provider>
  );
}

export default Dashboard;
