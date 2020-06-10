import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementCategory from './subcomponents/AchievementCategory';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import {
  AchievementOverview,
  AchievementStatus,
  SubAchivementOverview,
  AchievementModalOverview,
  AchievementAbility
} from '../../../commons/achievements/AchievementTypes';

export type DispatchProps = {};

export type StateProps = {};

const achievementOverviews: AchievementOverview[] = [
  {
    title: 'Rune Master',
    subAchievementTitles: ['Beyond the Second Dimension', 'Colorful Carpet'],
    status: AchievementStatus.ACTIVE,
    ability: AchievementAbility.ACADEMIC,
    exp: 100,
    deadline: new Date(2020, 5, 1, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior',
    subAchievementTitles: [
      'Keyboard Warrior: Bronze Tier',
      'Keyboard Warrior: Silver Tier',
      'Keyboard Warrior: Gold Tier'
    ],
    status: AchievementStatus.ACTIVE,
    ability: AchievementAbility.COMMUNITY,
    exp: 100,
    deadline: undefined
  },
  {
    title: 'Adventure Time',
    subAchievementTitles: [],
    status: AchievementStatus.COMPLETED,
    ability: AchievementAbility.EXPLORATION,
    exp: 100,
    deadline: new Date(2020, 5, 11, 6, 0, 0)
  },
  {
    title: "Sort'a Easy",
    subAchievementTitles: [],
    status: AchievementStatus.ACTIVE,
    ability: AchievementAbility.EXPLORATION,
    exp: 100,
    deadline: undefined
  }
];

const subAchievementOverviews: SubAchivementOverview[] = [
  {
    title: 'Beyond the Second Dimension',
    exp: 200,
    deadline: undefined
  },
  {
    title: 'Colorful Carpet',
    exp: 100,
    deadline: new Date(2020, 5, 1, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior: Bronze Tier',
    exp: 200,
    deadline: new Date(2020, 4, 1, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior: Silver Tier',
    exp: 200,
    deadline: new Date(2020, 4, 1, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior: Gold Tier',
    exp: 200,
    deadline: new Date(2020, 4, 1, 6, 0, 0)
  }
];

const modalOverviews: AchievementModalOverview[] = [
  {
    title: 'Rune Master',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
    description: 'Cookies!'
  },
  {
    title: 'Keyboard Warrior',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/glowingLine%40x2.png',
    description: 'Huehuehuehuehuehuehuehue'
  },
  {
    title: 'Adventure Time',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/gosperCurve%40x2.png',
    description: 'Uvuvwevwevwe Onyetenyevwe Ugwemubwem Ossas'
  },
  {
    title: 'Beyond the Second Dimension',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/morseCode%40x2.png',
    description:
      'Compiled successfully! You can now view cadet-frontend in the browser. Note that the development build is not optimized. To create a production build, use yarn build.'
  },
  {
    title: 'Colorful Carpet',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/mysteryCube%40x2.png',
    description: 'description'
  },
  {
    title: 'Keyboard Warrior: Gold Tier',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/messyClassroom%40x2.png',
    description: '?'
  }
];

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
