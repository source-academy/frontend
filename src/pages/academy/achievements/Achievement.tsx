import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import {
  AchievementStatus,
  FilterStatus,
  AchievementItem,
  SubAchievementItem
} from '../../../commons/achievements/AchievementTypes';
import {
  subAchievementList,
  achievementList,
  achievementModalList
} from 'src/commons/mocks/AchievementMocks';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [modal, setModal] = useState('');
  const [filteredStatus, setFilteredStatus] = useState<FilterStatus>(FilterStatus.ALL);

  /**
   * Maps an array of sub achievement titles to their corresponding sub achievement item
   *
   * @param titles An array of titles
   * @returns An array of sub achievement items
   */
  const mapTitlesToSubAchievements = (titles: string[]) =>
    titles.map(targetTitle =>
      subAchievementList.filter(subAchievement => subAchievement.title === targetTitle)
    );

  /**
   * Filters an array of achievement items by filterStatus
   *
   * @param achievementList An array of achievement items
   * @param filterStatus The filterStatus used to filter the achievement list
   * @returns An array of achievement items
   */
  const filterAchievementsByFilterStatus = (
    achievementList: AchievementItem[],
    filterStatus: FilterStatus
  ) => {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return achievementList;
      case FilterStatus.ACTIVE:
        return achievementList.filter(
          achievement => achievement.status === AchievementStatus.ACTIVE
        );
      case FilterStatus.COMPLETED:
        return achievementList.filter(
          achievement => achievement.status === AchievementStatus.COMPLETED
        );
      default:
        return [];
    }
  };

  /**
   * Count the number of achievement items by filterStatus
   *
   * @param achievementList An array of achievement items
   * @param subAchievementList An array of sub achievement items
   * @param filterStatus The filterStatus used to filter the achievement list
   * @returns The number of items
   */
  const countItemByFilterStatus = (
    achievementList: AchievementItem[],
    subAchievementList: SubAchievementItem[],
    filterStatus: FilterStatus
  ) => {
    switch (filterStatus) {
      case FilterStatus.ALL:
        return achievementList.length + subAchievementList.length;
      case FilterStatus.ACTIVE:
        return (
          achievementList.filter(item => item.status === AchievementStatus.ACTIVE).length +
          subAchievementList.filter(item => item.status === AchievementStatus.ACTIVE).length
        );
      case FilterStatus.COMPLETED:
        return (
          achievementList.filter(item => item.status === AchievementStatus.COMPLETED).length +
          subAchievementList.filter(item => item.status === AchievementStatus.COMPLETED).length
        );
      default:
        return 0;
    }
  };

  /**
   * Maps the achievement list to their corresponding AchievementTask Elements
   *
   * @param achievementList An array of achievement items
   * @returns AchievementTask Elements
   */
  const mapAchievementListToTasks = (achievementList: AchievementItem[]) => {
    return achievementList.map(achievement => (
      <AchievementTask
        title={achievement.title}
        details={achievement.details}
        subAchievementList={mapTitlesToSubAchievements(achievement.subAchievementTitles)}
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
            status={FilterStatus.ALL}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.GLOBE}
            count={countItemByFilterStatus(achievementList, subAchievementList, FilterStatus.ALL)}
          />
          <AchievementFilter
            status={FilterStatus.ACTIVE}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.LOCATE}
            count={countItemByFilterStatus(
              achievementList,
              subAchievementList,
              FilterStatus.ACTIVE
            )}
          />
          <AchievementFilter
            status={FilterStatus.COMPLETED}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.ENDORSED}
            count={countItemByFilterStatus(
              achievementList,
              subAchievementList,
              FilterStatus.COMPLETED
            )}
          />
        </div>

        <div className="cards">
          <ul className="display-list">
            {mapAchievementListToTasks(
              filterAchievementsByFilterStatus(achievementList, filteredStatus)
            )}
          </ul>
        </div>

        <AchievementModal title={modal} achievementModalList={achievementModalList} />
      </div>
    </div>
  );
}

export default Achievement;
