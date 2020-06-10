import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementCategory from './subcomponents/AchievementCategory';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';
import { AchievementOverview, AchievementStatus } from 'src/commons/achievements/AchievementTypes';

export type DispatchProps = {};

export type StateProps = {};

const achievementOverview: AchievementOverview[] = [
  {
    title: 'Rune Master',
    subachievementTitles: ['Beyond the Second Dimension', 'Colorful Carpet'],
    status: AchievementStatus.PENDING
  },
  {
    title: 'Keyboard Warrior',
    subachievementTitles: ['Keyboard Warrior: Gold Tier'],
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Adventure Time',
    subachievementTitles: [],
    status: AchievementStatus.COMPLETED
  }
];

const subachievementOverview = [
  { title: 'Beyond the Second Dimension' },
  { title: 'Colorful Carpet' },
  { title: 'Keyboard Warrior: Gold Tier' }
];

const modalOverview = [
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
      subachievementOverview.filter(subachievement => subachievement.title === target)
    );

  const filterAchievementsByStatus = (achievementOverview: AchievementOverview[]) => {
    if (filteredStatus === AchievementStatus.PENDING) {
      return achievementOverview;
    }

    return achievementOverview.filter(
      achievementOverview => achievementOverview.status === filteredStatus
    );
  };

  const getAchievementTasks = (achievementOverview: AchievementOverview[]) => {
    return filterAchievementsByStatus(achievementOverview).map(achievement => (
      <AchievementTask
        title={achievement.title}
        subachievements={mapTitlesToSubachievements(achievement.subachievementTitles)}
        setModal={setModal}
      />
    ));
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
            count={22}
          />
          <AchievementCategory
            status={AchievementStatus.ACTIVE}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.LOCATE}
            count={15}
          />
          <AchievementCategory
            status={AchievementStatus.COMPLETED}
            setFilteredStatus={setFilteredStatus}
            icon={IconNames.ENDORSED}
            count={7}
          />
        </div>

        <div className="cards">
          <ul>{getAchievementTasks(achievementOverview)}</ul>
        </div>

        <AchievementModal title={modal} modalOverview={modalOverview} />
      </div>
    </div>
  );
}

export default Achievement;
