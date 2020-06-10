import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementCategory from './subcomponents/AchievementCategory';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';

export type DispatchProps = {};

export type StateProps = {};

const achievementOverview = [
  {
    title: 'Rune Master',
    subachievementTitles: ['Beyond the Second Dimension', 'Colorful Carpet']
  },
  { title: 'Keyboard Warrior', subachievementTitles: ['Keyboard Warrior: Gold Tier'] },
  { title: 'Adventure Time', subachievementTitles: [] }
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

  const mapTitlesToSubachievements = (titles: string[]) =>
    titles.map(target =>
      subachievementOverview.filter(subachievement => subachievement.title === target)
    );

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementCategory category={'ALL'} icon={IconNames.GLOBE} missions={22} />
          <AchievementCategory category={'ACTIVE'} icon={IconNames.LOCATE} missions={15} />
          <AchievementCategory category={'COMPLETED'} icon={IconNames.ENDORSED} missions={7} />
        </div>

        <div className="cards">
          <ul>
            {achievementOverview.map(achievement => (
              <AchievementTask
                title={achievement.title}
                subachievements={mapTitlesToSubachievements(achievement.subachievementTitles)}
                setModal={setModal}
              />
            ))}
          </ul>
        </div>

        <AchievementModal title={modal} modalOverview={modalOverview} />
      </div>
    </div>
  );
}

export default Achievement;
