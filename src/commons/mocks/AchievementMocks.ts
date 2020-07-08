import { AchievementAbility, AchievementItem } from '../achievements/AchievementTypes';

export const defaultMockAchievements: AchievementItem[] = [
  {
    id: 0,
    title: 'Rune Master',
    ability: AchievementAbility.EFFORT,
    isTask: true,
    prerequisiteIds: [1, 2],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Beyond the Second Dimension achievement',
        goalProgress: 213,
        goalTarget: 250
      },
      {
        goalId: 1,
        goalText: 'Complete Colorful Carpet achievement',
        goalProgress: 0,
        goalTarget: 250
      },
      {
        goalId: 2,
        goalText: 'Bonus for completing Rune Master achievement',
        goalProgress: 0,
        goalTarget: 100
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/robotDog%40x2.png',
      description: 'Cookies!',
      completionText: 'Cooooookiess!!!'
    }
  },
  {
    id: 1,
    title: 'Beyond the Second Dimension',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 7, 22, 0, 0, 0),
    release: new Date(2020, 7, 19, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Beyond the Second Dimension mission',
        goalProgress: 100,
        goalTarget: 100
      },
      {
        goalId: 1,
        goalText: 'Score earned from Beyond the Second Dimension mission',
        goalProgress: 113,
        goalTarget: 150
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/glowingLine%40x2.png',
      description: 'Huehuehuehuehuehuehuehue',
      completionText: 'BTSD'
    }
  },
  {
    id: 2,
    title: 'Colorful Carpet',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 7, 29, 0, 0, 0),
    release: new Date(2020, 7, 26, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Colorful Carpet mission',
        goalProgress: 0,
        goalTarget: 100
      },
      {
        goalId: 1,
        goalText: 'Score earned from Colorful Carpet mission',
        goalProgress: 0,
        goalTarget: 150
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/gosperCurve%40x2.png',
      description: 'Uvuvwevwevwe Onyetenyevwe Ugwemubwem Ossas',
      completionText: 'CC'
    }
  },
  {
    id: 3,
    title: 'Unpublished',
    ability: AchievementAbility.CORE,
    isTask: false,
    prerequisiteIds: [],
    goals: [],
    position: 0,
    backgroundImageUrl:
      'https://www.publicdomainpictures.net/pictures/30000/velka/plain-white-background.jpg',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/images/gosperCurve%40x2.png',
      description: '',
      completionText: ''
    }
  }
];

let mockAchievements = defaultMockAchievements;

export const fetchMockAchievements = () => {
  return mockAchievements;
};

export const updateMockAchievements = (newAchievements: AchievementItem[]) => {
  mockAchievements = newAchievements;
};
