import { AchievementAbility, AchievementItem } from '../achievements/AchievementTypes';

export const achievementData: AchievementItem[] = [
  {
    id: 1,
    title: 'Rune Master',
    ability: AchievementAbility.ACADEMIC,
    exp: 0,
    isTask: true,
    prerequisiteIds: [2, 3],
    completionGoal: 2,
    completionProgress: 0,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
      description: 'Cookies!',
      goalText: 'Complete Beyond the Second Dimension & Colorful Carpet missions.',
      completionText: 'Cooooookiess!!!'
    }
  },
  {
    id: 2,
    title: 'Beyond the Second Dimension',
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 5, 25, 0, 0, 0),
    release: new Date(2020, 5, 12, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    completionGoal: 100,
    completionProgress: 77,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/glowingLine%40x2.png',
      description: 'Huehuehuehuehuehuehuehue',
      goalText: 'Complete Beyond the Second Dimension mission.',
      completionText: 'BTSD'
    }
  },
  {
    id: 3,
    title: 'Colorful Carpet',
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 5, 23, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    completionGoal: 100,
    completionProgress: 23,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/gosperCurve%40x2.png',
      description: 'Uvuvwevwevwe Onyetenyevwe Ugwemubwem Ossas',
      goalText: 'Complete Colorful Carpet mission.',
      completionText: 'CC'
    }
  },
  {
    id: 4,
    title: 'Keyboard Warrior',
    ability: AchievementAbility.COMMUNITY,
    exp: 0,
    isTask: true,
    prerequisiteIds: [5, 6, 7],
    completionGoal: 3,
    completionProgress: 2,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/morseCode%40x2.png',
      description:
        'Compiled successfully! You can now view cadet-frontend in the browser. Note that the development build is not optimized. To create a production build, use yarn build.',
      goalText: 'Reach Gold Tier in Keyboard Warrior achievements.',
      completionText: 'YOU DA KEYBOARD WARRIOR'
    }
  },
  {
    id: 5,
    title: 'Keyboard Warrior - Bronze Tier',
    ability: AchievementAbility.COMMUNITY,
    exp: 50,
    isTask: false,
    prerequisiteIds: [],
    completionGoal: 10,
    completionProgress: 92,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
      description: 'Keyboard Warrior - Bronze Tier!',
      goalText: 'Keyboard Warrior - Bronze Tier!!',
      completionText: 'Keyboard Warrior - Bronze Tier!!!'
    }
  },
  {
    id: 6,
    title: 'Keyboard Warrior - Silver Tier',
    ability: AchievementAbility.COMMUNITY,
    exp: 100,
    isTask: false,
    prerequisiteIds: [],
    completionGoal: 50,
    completionProgress: 92,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
      description: 'Keyboard Warrior - Silver Tier!',
      goalText: 'Keyboard Warrior - Silver Tier!!',
      completionText: 'Keyboard Warrior - Silver Tier!!!'
    }
  },
  {
    id: 7,
    title: 'Keyboard Warrior - Gold Tier',
    ability: AchievementAbility.COMMUNITY,
    exp: 200,
    isTask: false,
    prerequisiteIds: [],
    completionGoal: 100,
    completionProgress: 92,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
      description: 'Keyboard Warrior - Gold Tier!',
      goalText: 'Keyboard Warrior - Gold Tier!!',
      completionText: 'Keyboard Warrior - Gold Tier!!!'
    }
  },
  {
    id: 8,
    title: "That was Sort'a Easy",
    ability: AchievementAbility.ACADEMIC,
    exp: 250,
    deadline: new Date(2020, 6, 22, 0, 0, 0),
    release: new Date(2020, 6, 8, 0, 0, 0),
    isTask: true,
    prerequisiteIds: [],
    completionGoal: 100,
    completionProgress: 10,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/mysteryCube%40x2.png',
      description: 'description',
      goalText: 'Complete Sorting mission.',
      completionText: 'Good job!'
    }
  },
  {
    id: 9,
    title: 'Mission Master',
    ability: AchievementAbility.EFFORT,
    exp: 80,
    isTask: true,
    prerequisiteIds: [1, 8],
    completionGoal: 2,
    completionProgress: 0,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/streamsDevice%40x2.png',
      description: '?',
      goalText: "Complete Rune Master & That was Sort'a Easy achievement.",
      completionText: 'Such wow. Mission Master.'
    }
  },
  {
    id: 10,
    title: 'Mission Grandmaster',
    ability: AchievementAbility.EFFORT,
    exp: 80,
    isTask: true,
    prerequisiteIds: [4, 9],
    completionGoal: 2,
    completionProgress: 0,
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/streamsDevice%40x2.png',
      description: '!!!',
      goalText: 'Complete All mission achievement.',
      completionText: 'Such wow. Mission Grandmaster.'
    }
  }
];

export const semester1Weeks = {
  2: new Date(2020, 7, 17, 0, 0, 0),
  3: new Date(2020, 7, 24, 0, 0, 0),
  4: new Date(2020, 7, 31, 0, 0, 0),
  5: new Date(2020, 8, 7, 0, 0, 0),
  6: new Date(2020, 8, 14, 0, 0, 0),
  7: new Date(2020, 8, 28, 0, 0, 0),
  8: new Date(2020, 9, 5, 0, 0, 0),
  9: new Date(2020, 9, 12, 0, 0, 0),
  10: new Date(2020, 9, 19, 0, 0, 0),
  11: new Date(2020, 9, 26, 0, 0, 0),
  12: new Date(2020, 10, 2, 0, 0, 0),
  13: new Date(2020, 10, 9, 0, 0, 0)
};
