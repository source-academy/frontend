import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';

import { abilityColor } from '../../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../../features/achievement/AchievementTypes';
import AchievementFilter from './subcomponents/AchievementFilter';
import AchievementModal from './subcomponents/AchievementModal';
import AchievementOverview from './subcomponents/AchievementOverview';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementInferencer from './subcomponents/utils/AchievementInferencer';

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
    const isTrue = (value?: string): boolean =>
      typeof value === 'string' && value.toUpperCase() === 'TRUE';

    if (isTrue(process.env.REACT_APP_USE_BACKEND)) {
      handleAchievementsFetch();
    }
  }, [handleAchievementsFetch]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const handleFilterColor = (status: FilterStatus) => {
    return status === filterStatus ? '#2dd1f9' : '#ffffff';
  };

  const handleGlow = (id: number) => {
    if (id === modalId) {
      const ability = inferencer.getAchievementItem(id).ability;
      return {
        border: `1px solid ${abilityColor(ability)}`,
        boxShadow: `0 0 10px ${abilityColor(ability)}`
      };
    }
    return {};
  };

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        displayModal={setModalId}
        handleGlow={handleGlow}
      />
    ));

  return (
    <div className="AchievementDashboard">
      <div className="achievement-overview">
        <AchievementOverview
          name={name === undefined ? 'User' : name}
          studio={group === null ? 'Staff' : group}
          inferencer={inferencer}
        />
      </div>
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

        <div className="modal-container">
          <AchievementModal id={modalId} inferencer={inferencer} handleGlow={handleGlow} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
