import React, { useState /* useEffect */ } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import { FilterStatus, AchievementItem } from '../../../commons/achievements/AchievementTypes';
import { mockAchievementData } from '../../../commons/mocks/AchievementMocks';
import Inferencer from './subcomponents/utils/Inferencer';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';

export type DispatchProps = {
  handleAchievementsFetch: any;
};

export type StateProps = {
  achievementData: AchievementItem[];
};

function Achievement(props: DispatchProps & StateProps) {
  /* TODO: Uncomment before Production
  const { handleAchievementsFetch, achievementItems } = props;

  useEffect(() => {
    handleAchievementsFetch();
  }, [handleAchievementsFetch]);
  */

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const inferencer = new Inferencer(mockAchievementData);

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
