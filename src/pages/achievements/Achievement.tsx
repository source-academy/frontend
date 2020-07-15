import React, { useState, useEffect } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import Inferencer from './subcomponents/utils/Inferencer';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import { FilterStatus, AchievementAbility } from '../../commons/achievements/AchievementTypes';
import AchievementOverview from './subcomponents/AchievementOverview';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
};

export type StateProps = {
  inferencer: Inferencer;
  name?: string;
  group: string | null;
};

function Achievement(props: DispatchProps & StateProps) {
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

  const handleGlow = (id: number) => {
    if (id === modalId) {
      const ability = inferencer.getAchievementItem(id).ability;
      switch (ability) {
        case AchievementAbility.CORE:
          return {
            border: '1px solid #ffb412',
            boxShadow: '0 0 10px #ffb412'
          };
        case AchievementAbility.EFFORT:
          return {
            border: '1px solid #b5ff61',
            boxShadow: '0 0 10px #b5ff61'
          };
        case AchievementAbility.EXPLORATION:
          return {
            border: '1px solid #9ecaed',
            boxShadow: '0 0 10px #9ecaed'
          };
        case AchievementAbility.COMMUNITY:
          return {
            border: '1px solid #ff6780',
            boxShadow: '0 0 10px #ff6780'
          };
        default:
          return {};
      }
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
    <div className="Achievements">
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
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={inferencer.getFilterCount(FilterStatus.ACTIVE)}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={inferencer.getFilterCount(FilterStatus.COMPLETED)}
          />
        </div>

        <ul className="cards-container">
          {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
        </ul>

        <div className="modal-container">
          <AchievementModal id={modalId} inferencer={inferencer} handleGlow={handleGlow} />
        </div>
      </div>
    </div>
  );
}

export default Achievement;
