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
  handleAchievementsFetch: () => void;
};

export type StateProps = {
  inferencer: AchievementInferencer;
  name?: string;
  group: string | null;
};

function Dashboard(props: DispatchProps & StateProps) {
  const { inferencer, name, group, handleAchievementsFetch } = props;

  useEffect(() => {
    if (Constants.useBackend) {
      handleAchievementsFetch();
    }
  }, [handleAchievementsFetch]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [viewId, setViewId] = useState<number>(-1);

  // Filter icon turns blue when selected, otherwise white
  const handleFilterColor = (status: FilterStatus) =>
    status === filterStatus ? FilterColors.BLUE : FilterColors.WHITE;

  // Make Flex achievements parmanently glowing and the selected achievement glow
  const handleGlow = (id: number) => {
    const ability = inferencer.getAchievementItem(id).ability;
    return ability === AchievementAbility.FLEX || id === viewId
      ? getAbilityGlow(ability)
      : undefined;
  };

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        displayView={setViewId}
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
        <div className="filters">
          <AchievementFilter
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={inferencer.getFilterCount(FilterStatus.ALL)}
            handleFilterColor={handleFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={inferencer.getFilterCount(FilterStatus.ACTIVE)}
            handleFilterColor={handleFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={inferencer.getFilterCount(FilterStatus.COMPLETED)}
            handleFilterColor={handleFilterColor}
          />
        </div>

        <ul className="list-container">
          {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
        </ul>

        <AchievementView id={viewId} inferencer={inferencer} handleGlow={handleGlow} />
      </div>
    </div>
  );
}

export default Dashboard;
