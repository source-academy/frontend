import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import AchievementModal from './subcomponents/AchievementModal';
import AchievementTask from './subcomponents/AchievementTask';
import {
  AchievementStatus,
  FilterStatus,
  AchievementItem
} from '../../../commons/achievements/AchievementTypes';
import { achievementDict, achievementModalList } from 'src/commons/mocks/AchievementMocks';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [modal, setModal] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);

  /**
   * Count the number of achievement items by filterStatus
   *
   * @param achievementDict A Dictionary of Achievement IDs and their Items
   * @param filterStatus The filterStatus used to filter the achievement dict
   * @returns The number of items
   */
  const countItemByFilterStatus = (
    achievementDict: { [id: number]: AchievementItem },
    filterStatus: FilterStatus
  ) => {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return Object.keys(achievementDict).length;
      case FilterStatus.ACTIVE:
        return Object.values(achievementDict).filter(
          achievement => achievement.status === AchievementStatus.ACTIVE
        ).length;
      case FilterStatus.COMPLETED:
        return Object.values(achievementDict).filter(
          achievement => achievement.status === AchievementStatus.COMPLETED
        ).length;
      default:
        return 0;
    }
  };

  /**
   * Maps the achievement dict to AchievementTask Elements
   *
   * This function creates an AchievementTask for achievement items that
   * has isTask=true.
   *
   * @param achievementDict A Dictionary of Achievement IDs and their Items
   * @returns AchievementTask Elements
   */
  const mapAchievementDictToTasks = (achievementDict: { [id: number]: AchievementItem }) => {
    return Object.values(achievementDict)
      .filter(achievement => achievement.isTask)
      .map(achievement => (
        <AchievementTask
          achievement={achievement}
          achievementDict={achievementDict}
          filterStatus={filterStatus}
          setModal={setModal}
        />
      ));
  };

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementFilter
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={countItemByFilterStatus(achievementDict, FilterStatus.ALL)}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={countItemByFilterStatus(achievementDict, FilterStatus.ACTIVE)}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={countItemByFilterStatus(achievementDict, FilterStatus.COMPLETED)}
          />
        </div>

        <div className="cards">
          <ul className="display-list">{mapAchievementDictToTasks(achievementDict)}</ul>
        </div>

        <AchievementModal title={modal} achievementModalList={achievementModalList} />
      </div>
    </div>
  );
}

export default Achievement;
