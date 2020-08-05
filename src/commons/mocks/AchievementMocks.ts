import {
  AchievementAbility,
  AchievementGoal,
  AchievementItem,
  GoalType
} from '../../features/achievement/AchievementTypes';

export const mockAchievements: AchievementItem[] = [
  {
    id: 0,
    title: 'Rune Master',
    ability: AchievementAbility.CORE,
    isTask: true,
    position: 1,
    prerequisiteIds: [2, 1],
    goalIds: [0],
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
    goalIds: [1],
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
    goalIds: [2],
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
    prerequisiteIds: [5, 6],
    goalIds: [3],
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
    goalIds: [4],
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
    goalIds: [5],
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
    goalIds: [6, 7],
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
    prerequisiteIds: [9],
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
    goalIds: [8],
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
    goalIds: [9],
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

export const mockGoals: AchievementGoal[] = [
  {
    id: 0,
    text: 'Bonus for completing Colorful Carpet & Beyond the Second Dimension Achievements',
    maxExp: 100,
    type: GoalType.BINARY,
    meta: {
      condition: `AND(
        {
          event: 'achievement',
          restriction: 2,
        },
        {
          event: 'achievement',
          restriction: 1,
        },
      )`
    },
    exp: 0,
    completed: false
  },
  {
    id: 1,
    text: 'XP earned from Beyond the Second Dimension Mission',
    maxExp: 250,
    type: GoalType.ASSESSMENT,
    meta: { assessmentId: 5, requiredCompletionExp: 200 },
    exp: 213,
    completed: true
  },
  {
    id: 2,
    text: 'XP earned from Colorful Carpet Mission',
    maxExp: 250,
    type: GoalType.ASSESSMENT,
    meta: { assessmentId: 3, requiredCompletionExp: 200 },
    exp: 0,
    completed: false
  },
  {
    id: 3,
    text: 'Bonus for completing Curve Introduction & Curve Manipulation Achievements',
    maxExp: 100,
    type: GoalType.BINARY,
    meta: {
      condition: `AND(
      {
        event: 'achievement',
        restriction: 4,
      },
      {
        event: 'achievement',
        restriction: 5,
      },
    )`
    },
    exp: 0,
    completed: false
  },
  {
    id: 4,
    text: 'XP earned from Curve Introduction Mission',
    maxExp: 250,
    type: GoalType.ASSESSMENT,
    meta: { assessmentId: 7, requiredCompletionExp: 150 },
    exp: 178,
    completed: true
  },
  {
    id: 5,
    text: 'XP earned from Curve Manipulation Mission',
    maxExp: 250,
    type: GoalType.ASSESSMENT,
    meta: { assessmentId: 8, requiredCompletionExp: 200 },
    exp: 191,
    completed: false
  },
  {
    id: 6,
    text: 'Submit Source 3 Path',
    maxExp: 100,
    type: GoalType.BINARY,
    meta: {
      condition: `
      {
        event: 'assessment-submission',
        restriction: paths.SOURCE_THREE,
      },
    `
    },
    exp: 100,
    completed: true
  },
  {
    id: 7,
    text: 'XP earned from Source 3 Path',
    maxExp: 300,
    type: GoalType.ASSESSMENT,
    meta: {
      assessmentId: 12,
      requiredCompletionExp: 300
    },
    exp: 300,
    completed: true
  },
  {
    id: 8,
    text: 'Each Top Voted answer in Piazza gives 10 XP',
    maxExp: 100,
    type: GoalType.MANUAL,
    meta: {},
    exp: 40,
    completed: false
  },
  {
    id: 9,
    text: 'Submit 1 PR to Source Academy Github',
    maxExp: 100,
    type: GoalType.MANUAL,
    meta: {},
    exp: 100,
    completed: true
  },
  {
    id: 10,
    text: 'Be the Koolest Kidz in SOC by redeeming this 100 XP achievement yourself',
    maxExp: 100,
    type: GoalType.BINARY,
    meta: {
      condition: `
      {
        event: 'achievement',
        restriction: 'false',
      },
    `
    },
    exp: 0,
    completed: false
  }
];
