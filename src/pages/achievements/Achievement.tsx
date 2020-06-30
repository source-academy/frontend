import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import Inferencer from './subcomponents/utils/Inferencer';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import { FilterStatus } from '../../commons/achievements/AchievementTypes';

export type DispatchProps = {
  handleAchievementsFetch: any;
};

export type StateProps = {
  inferencer: Inferencer;
};

function Achievement(props: DispatchProps & StateProps) {
  const { inferencer } = props;

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        displayModal={setModalId}
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

        <AchievementModal id={modalId} inferencer={inferencer} />
      </div>
    </div>
  );
}

export default Achievement;
