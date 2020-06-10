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
  AchievementPath
} from '../../../commons/achievements/AchievementTypes';

export type DispatchProps = {};

export type StateProps = {};

const achievementOverviews: AchievementOverview[] = [
  {
    title: 'Rune Master',
    subachievementTitles: ['Beyond the Second Dimension', 'Colorful Carpet'],
    status: AchievementStatus.PENDING,
    path: AchievementPath.ACADEMIC,
    exp: 100,
    deadline: new Date(2020, 5, 1, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior',
    subachievementTitles: ['Keyboard Warrior: Gold Tier'],
    status: AchievementStatus.ACTIVE,
    path: AchievementPath.ACADEMIC,
    exp: 100,
    deadline: undefined
  },
  {
    title: 'Adventure Time',
    subachievementTitles: [],
    status: AchievementStatus.COMPLETED,
    path: AchievementPath.ACADEMIC,
    exp: 100,
    deadline: new Date(2020, 5, 11, 6, 0, 0)
  },
  {
    title: 'Keyboard Warrior',
    subachievementTitles: ['Keyboard Warrior: Gold Tier'],
    status: AchievementStatus.ACTIVE,
    path: AchievementPath.ACADEMIC,
    exp: 100,
    deadline: undefined
  },
  {
    title: 'Keyboard Warrior',
    subachievementTitles: ['Keyboard Warrior: Gold Tier'],
    status: AchievementStatus.ACTIVE,
    path: AchievementPath.ACADEMIC,
    exp: 100,
    deadline: undefined
  }
];

const subachievementOverviews: SubAchivementOverview[] = [
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
  const [filteredStatus, setFilteredStatus] = useState<AchievementStatus>(
    AchievementStatus.PENDING
  );

  const mapTitlesToSubachievements = (titles: string[]) =>
    titles.map(target =>
      subachievementOverviews.filter(subachievement => subachievement.title === target)
    );

  const filterAchievementsByStatus = (
    achievementOverviews: AchievementOverview[],
    status: AchievementStatus
  ) => {
    if (status === AchievementStatus.PENDING) {
      return achievementOverviews;
    }

    return achievementOverviews.filter(
      achievementOverview => achievementOverview.status === status
    );
  };

  const getAchievementTasks = (achievementOverviews: AchievementOverview[]) => {
    return filterAchievementsByStatus(achievementOverviews, filteredStatus).map(achievement => (
      <AchievementTask
        title={achievement.title}
        path={achievement.path}
        exp={achievement.exp}
        deadline={achievement.deadline}
        subachievements={mapTitlesToSubachievements(achievement.subachievementTitles)}
        setModal={setModal}
      />
    ));
  };

  const getTasksCountByStatus = (
    achievementOverviews: AchievementOverview[],
    status: AchievementStatus
  ) => {
    switch (status) {
      case AchievementStatus.PENDING:
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
            status={AchievementStatus.PENDING}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.GLOBE}
            count={getTasksCountByStatus(achievementOverviews, AchievementStatus.PENDING)}
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
          <ul className="display-list">{getAchievementTasks(achievementOverviews)}</ul>
        </div>

        <AchievementModal title={modal} modalOverviews={modalOverviews} />
      </div>
    </div>
  );
}

export default Achievement;
