import {
  AchievementAbility,
  AchievementItem,
  AchievementModalItem,
  AchievementStatus
} from '../achievements/AchievementTypes';

export const achievementDict: { [id: number]: AchievementItem } = {
  1: {
    id: 1,
    title: 'Rune Master [ACTIVE]',
    ability: AchievementAbility.ACADEMIC,
    isTask: true,
    prerequisites: [2, 3],
    status: AchievementStatus.ACTIVE,
    completionGoal: 3
  },
  2: {
    id: 2,
    title: 'Beyond the Second Dimension [ACTIVE]',
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 7, 1, 0, 0, 0),
    isTask: false,
    status: AchievementStatus.ACTIVE,
    completionGoal: 100
  },
  3: {
    id: 3,
    title: 'Colorful Carpet [ACTIVE]',
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 7, 3, 0, 0, 0),
    isTask: false,
    status: AchievementStatus.ACTIVE,
    completionGoal: 100
  },
  4: {
    id: 4,
    title: 'Keyboard Warrior [ACTIVE]',
    ability: AchievementAbility.COMMUNITY,
    isTask: true,
    prerequisites: [5, 6, 7],
    status: AchievementStatus.ACTIVE,
    completionGoal: 3
  },
  5: {
    id: 5,
    title: 'Keyboard Warrior - Bronze Tier [COMPLETED]',
    ability: AchievementAbility.COMMUNITY,
    exp: 50,
    isTask: false,
    status: AchievementStatus.COMPLETED,
    completionGoal: 10
  },
  6: {
    id: 6,
    title: 'Keyboard Warrior - Silver Tier [COMPLETED]',
    ability: AchievementAbility.COMMUNITY,
    exp: 100,
    isTask: false,
    status: AchievementStatus.COMPLETED,
    completionGoal: 50
  },
  7: {
    id: 7,
    title: 'Keyboard Warrior - Gold Tier [ACTIVE]',
    ability: AchievementAbility.COMMUNITY,
    exp: 200,
    isTask: false,
    status: AchievementStatus.ACTIVE,
    completionGoal: 100
  },
  8: {
    id: 8,
    title: "That was Sort'a Easy [EXPIRED]",
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 6, 4, 0, 0, 0),
    isTask: true,
    status: AchievementStatus.EXPIRED,
    completionGoal: 100
  },
  9: {
    id: 9,
    title: 'Mission Master [ACTIVE]',
    ability: AchievementAbility.EFFORT,
    exp: 80,
    isTask: true,
    prerequisites: [1, 8],
    status: AchievementStatus.ACTIVE,
    completionGoal: 2
  }
};

export const achievementModalList: AchievementModalItem[] = [
  {
    title: 'Rune Master [ACTIVE]',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
    description: 'Cookies!'
  },
  {
    title: 'Beyond the Second Dimension [ACTIVE]',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/glowingLine%40x2.png',
    description: 'Huehuehuehuehuehuehuehue'
  },
  {
    title: 'Colorful Carpet [ACTIVE]',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/gosperCurve%40x2.png',
    description: 'Uvuvwevwevwe Onyetenyevwe Ugwemubwem Ossas'
  },
  {
    title: 'Keyboard Warrior [ACTIVE]',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/morseCode%40x2.png',
    description:
      'Compiled successfully! You can now view cadet-frontend in the browser. Note that the development build is not optimized. To create a production build, use yarn build.'
  },
  {
    title: "That was Sort'a Easy [EXPIRED]",
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/mysteryCube%40x2.png',
    description: 'description'
  },
  {
    title: 'Mission Master [ACTIVE]',
    modalImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/messyClassroom%40x2.png',
    description: '?'
  }
];
