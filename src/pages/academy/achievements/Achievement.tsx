import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import AchievementModal from './subcomponents/AchievementModal';
import AchievementTask from './subcomponents/AchievementTask';
import {
  AchievementStatus,
  FilterStatus,
  AchievementItem,
  AchievementProgress
} from '../../../commons/achievements/AchievementTypes';
import {
  achievementDict,
  achievementModalDict,
  studentProgress
} from 'src/commons/mocks/AchievementMocks';

export type DispatchProps = {};

export type StateProps = {};

/**
 * Count the number of achievement items by filterStatus
 *
 * @param {{ [id: number]: AchievementItem }} achievementDict A Dictionary of Achievement IDs and their Items
 * @param {FilterStatus} filterStatus The filterStatus used to filter the achievement dict
 * @returns {number} The number of items
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
 * This function creates an AchievementTask for each achievement item that
 * has isTask=true.
 *
 * @param {{ [id: number]: AchievementItem }} achievementDict A Dictionary of Achievement IDs and their Items
 * @returns AchievementTask Elements
 */
export const mapAchievementDictToTask = (
  achievementDict: { [id: number]: AchievementItem },
  filterStatus: FilterStatus,
  studentProgress: { [id: number]: AchievementProgress },
  setModalID?: any | undefined
) => {
  return Object.values(achievementDict)
    .filter(achievement => achievement.isTask)
    .map(achievement => (
      <AchievementTask
        key={achievement.title}
        studentProgress={studentProgress}
        achievement={achievement}
        achievementDict={achievementDict}
        filterStatus={filterStatus}
        setModalID={setModalID}
      />
    ));
};

function Achievement() {
  const [modalID, setModalID] = useState<number>(-1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);

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
          <ul className="display-list">
            {mapAchievementDictToTask(achievementDict, filterStatus, studentProgress, setModalID)}
          </ul>
        </div>

        <AchievementModal modalID={modalID} achievementModalDict={achievementModalDict} />
      </div>
    </div>
  );
}

export default Achievement;
