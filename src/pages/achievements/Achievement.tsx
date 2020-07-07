import React, { useState, useEffect } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import Inferencer from './subcomponents/utils/Inferencer';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import { FilterStatus, AchievementAbility } from '../../commons/achievements/AchievementTypes';

export type DispatchProps = {
  handleAchievementsFetch: () => void;
};

export type StateProps = {
  inferencer: Inferencer;
};

function Achievement(props: DispatchProps & StateProps) {
  const { inferencer, handleAchievementsFetch } = props;

  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const generateBackgroundGradient = (ability: AchievementAbility) => {
    switch (ability) {
      case 'Core':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(98, 89, 0, 0.8))`;
      case 'Community':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(247, 3, 240, 0.8))`;
      case 'Effort':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(77, 77, 77, 0.8))`;
      case 'Exploration':
        return `radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(10, 125, 78, 0.8))`;
      default:
        return ``;
    }
  };

  const handleGlow = (id: number) => {
    if (id === modalId) {
      return {
        border: '5px solid #4195fc',
        boxShadow: '0px 0px 20px #4195fc'
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
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
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

        <div className="cards">
          <ul className="display-list">{mapAchievementIdsToTasks(inferencer.listTaskIds())}</ul>
        </div>

        <AchievementModal
          generateBackgroundGradient={generateBackgroundGradient}
          id={modalId}
          inferencer={inferencer}
        />
      </div>
    </div>
  );
}

export default Achievement;
