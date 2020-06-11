import {
  AchievementAbility,
  AchievementModalOverview,
  AchievementOverview,
  AchievementStatus,
  SubAchivementOverview
} from '../achievements/AchievementTypes';

export const achievementOverviews: AchievementOverview[] = [
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

export const subAchievementOverviews: SubAchivementOverview[] = [
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

export const modalOverviews: AchievementModalOverview[] = [
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
