import { AchievementAbility, AchievementItem } from '../../features/achievement/AchievementTypes';

export const mockAchievements: AchievementItem[] = [
  {
    id: 0,
    title: 'Rune Master',
    ability: AchievementAbility.CORE,
    isTask: true,
    position: 1,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/rune-master-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Rune Master achievement'
    }
  },
  {
    id: 1,
    title: 'Beyond the Second Dimension',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 7, 6, 12, 30, 0),
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/btsd-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Beyond the Second Dimension achievement'
    }
  },
  {
    id: 2,
    title: 'Colorful Carpet',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 7, 8, 9, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/colorful-carpet-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Colorful Carpet achievement'
    }
  },
  {
    id: 3,
    title: '',
    ability: AchievementAbility.CORE,
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl: '',
    view: {
      canvasUrl: '',
      description: '',
      completionText: ''
    }
  },
  {
    id: 4,
    title: 'Curve Wizard',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 8, 15, 0, 0, 0),
    isTask: true,
    position: 4,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-wizard-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Wizard achievement'
    }
  },
  {
    id: 5,
    title: 'Curve Introduction',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 7, 28, 0, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-introduction-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Introduction achievement'
    }
  },
  {
    id: 6,
    title: 'Curve Manipulation',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 8, 5, 0, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-manipulation-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Manipulation achievement'
    }
  },
  {
    id: 7,
    title: 'The Source-rer',
    ability: AchievementAbility.EFFORT,
    deadline: new Date(2020, 7, 21, 0, 0, 0),
    isTask: true,
    position: 3,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/the-source-rer-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed The Source-rer achievement'
    }
  },
  {
    id: 8,
    title: 'Power of Friendship',
    ability: AchievementAbility.COMMUNITY,
    isTask: true,
    position: 2,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/power-of-friendship-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Power of Friendship achievement'
    }
  },
  {
    id: 9,
    title: 'Piazza Guru',
    ability: AchievementAbility.COMMUNITY,
    isTask: false,
    position: 0,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/piazza-guru-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Piazza Guru achievement'
    }
  },
  {
    id: 10,
    title: "That's the Spirit",
    ability: AchievementAbility.EXPLORATION,
    isTask: true,
    position: 5,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/thats-the-spirit-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: "Congratulations! You have completed That's the Spirit achievement"
    }
  },
  {
    id: 11,
    title: 'Kool Kidz',
    ability: AchievementAbility.FLEX,
    isTask: true,
    position: 6,
    prerequisiteIds: [],
    goalIds: [],
    cardTileUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/annotated-tile.png',
    view: {
      canvasUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description: 'Diz for teh K00L K1dz',
      completionText: 'U SO G00D'
    }
  }
];
