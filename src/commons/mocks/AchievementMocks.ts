import {
  AchievementAbility,
  AchievementModalItem,
  AchievementItem,
  AchievementStatus,
  SubAchievementItem
} from '../achievements/AchievementTypes';

export const achievementList: AchievementItem[] = [
  {
    title: 'Rune Master',
    details: {
      ability: AchievementAbility.ACADEMIC,
      deadline: new Date(2020, 5, 1, 6, 0, 0)
    },
    subAchievementTitles: ['Beyond the Second Dimension', 'Colorful Carpet'],
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Keyboard Warrior',
    details: {
      ability: AchievementAbility.COMMUNITY,
      exp: 100,
      deadline: undefined
    },
    subAchievementTitles: [
      'Keyboard Warrior: Bronze Tier',
      'Keyboard Warrior: Silver Tier',
      'Keyboard Warrior: Gold Tier'
    ],
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Adventure Time',
    details: {
      ability: AchievementAbility.EXPLORATION,
      exp: 100,
      deadline: new Date(2020, 5, 11, 6, 0, 0)
    },
    subAchievementTitles: [],
    status: AchievementStatus.COMPLETED
  },
  {
    title: "Sort'a Easy",
    details: {
      ability: AchievementAbility.EXPLORATION,
      exp: 100,
      deadline: undefined
    },
    subAchievementTitles: [],
    status: AchievementStatus.ACTIVE
  }
];

export const subAchievementList: SubAchievementItem[] = [
  {
    title: 'Beyond the Second Dimension',
    exp: 200,
    deadline: undefined,
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Colorful Carpet',
    exp: 100,
    deadline: new Date(2020, 5, 1, 6, 0, 0),
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Keyboard Warrior: Bronze Tier',
    exp: 50,
    deadline: new Date(2020, 4, 1, 6, 0, 0),
    status: AchievementStatus.COMPLETED
  },
  {
    title: 'Keyboard Warrior: Silver Tier',
    exp: 100,
    deadline: new Date(2020, 4, 1, 6, 0, 0),
    status: AchievementStatus.ACTIVE
  },
  {
    title: 'Keyboard Warrior: Gold Tier',
    exp: 200,
    deadline: new Date(2020, 4, 1, 6, 0, 0),
    status: AchievementStatus.ACTIVE
  }
];

export const achievementModalList: AchievementModalItem[] = [
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
