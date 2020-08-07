import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { FilterColors, getAbilityGlow } from '../../../features/achievement/AchievementConstants';
import { AchievementAbility, FilterStatus } from '../../../features/achievement/AchievementTypes';

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

function Dashboard(props: DispatchProps & StateProps) {
  const { inferencer, name, group, handleGetAchievements } = props;

  useEffect(() => {
    if (Constants.useBackend) {
      handleGetAchievements();
      // TODO: handleGetGoals();
    }
  }, [handleGetAchievements]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);

  // If an achievement is focused, the cards glow and dashboard displays the AchievementView
  const [focusId, setFocusId] = useState<number>(-1);

  /**
   * Returns blue hex code if the filter is selected, otherwise return white
   *
   * @param status current FilterStatus
   */
  const getFilterColor = (status: FilterStatus) =>
    status === filterStatus ? FilterColors.BLUE : FilterColors.WHITE;

  /**
   * Make focused achievement glow and Flex achievements permanently glowing
   *
   * @param id achievementId
   */
  const handleGlow = (id: number) => {
    const ability = inferencer.getAchievementItem(id).ability;
    return ability === AchievementAbility.FLEX || id === focusId
      ? getAbilityGlow(ability)
      : undefined;
  };

  /**
   * Maps an array of achievementId to <AchievementTask /> component
   *
   * @param taskIds an array of achievementId
   */
  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        setFocusId={setFocusId}
        handleGlow={handleGlow}
      />
    ));

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
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={inferencer.getFilterCount(FilterStatus.ALL)}
            getFilterColor={getFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={inferencer.getFilterCount(FilterStatus.ACTIVE)}
            getFilterColor={getFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={inferencer.getFilterCount(FilterStatus.COMPLETED)}
            getFilterColor={getFilterColor}
          />
        </div>

        <ul className="task-container">
          {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
        </ul>

        <div className="view-container">
          <AchievementView id={focusId} inferencer={inferencer} handleGlow={handleGlow} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
