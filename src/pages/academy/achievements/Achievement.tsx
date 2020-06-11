import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementCategory from './subcomponents/AchievementCategory';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import {
  AchievementOverview,
  AchievementStatus
} from '../../../commons/achievements/AchievementTypes';
import {
  subAchievementOverviews,
  achievementOverviews,
  modalOverviews
} from 'src/commons/mocks/AchievementMocks';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [modal, setModal] = useState('');
  const [filteredStatus, setFilteredStatus] = useState<AchievementStatus>( // change to filterStatus
    AchievementStatus.EXPIRED
  );

  const mapTitlesToSubAchievements = (titles: string[]) =>
    titles.map(
      target => subAchievementOverviews.filter(subAchievement => subAchievement.title === target) // change to uppercase A
    );

  const filterAchievementsByStatus = (
    achievementOverviews: AchievementOverview[],
    status: AchievementStatus
  ) => {
    if (status === AchievementStatus.EXPIRED) {
      // change to filterStatus
      return achievementOverviews;
    }

    return achievementOverviews.filter(
      achievementOverview => achievementOverview.status === status
    );
  };

  const mapAchievementOverviewsToTasks = (achievementOverviews: AchievementOverview[]) => {
    return filterAchievementsByStatus(achievementOverviews, filteredStatus).map(achievement => (
      <AchievementTask
        title={achievement.title}
        ability={achievement.ability}
        exp={achievement.exp}
        deadline={achievement.deadline}
        subAchievement={mapTitlesToSubAchievements(achievement.subAchievementTitles)}
        setModal={setModal}
      />
    ));
  };

  const getTasksCountByStatus = (
    // change to get every tasks instead
    achievementOverviews: AchievementOverview[],
    status: AchievementStatus
  ) => {
    switch (status) {
      case AchievementStatus.EXPIRED: // change to filterStatus.ALL
        return achievementOverviews.length;
      default:
        console.log(filterAchievementsByStatus(achievementOverviews, status));
        return filterAchievementsByStatus(achievementOverviews, status).length;
    }
  };

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementCategory
            status={AchievementStatus.EXPIRED}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.GLOBE}
            count={getTasksCountByStatus(achievementOverviews, AchievementStatus.EXPIRED)}
          />
          <AchievementCategory
            status={AchievementStatus.ACTIVE}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.LOCATE}
            count={getTasksCountByStatus(achievementOverviews, AchievementStatus.ACTIVE)}
          />
          <AchievementCategory
            status={AchievementStatus.COMPLETED}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.ENDORSED}
            count={getTasksCountByStatus(achievementOverviews, AchievementStatus.COMPLETED)}
          />
        </div>

        <div className="cards">
          <ul className="display-list">{mapAchievementOverviewsToTasks(achievementOverviews)}</ul>
        </div>

        <AchievementModal title={modal} modalOverviews={modalOverviews} />
      </div>
    </div>
  );
}

export default Achievement;
