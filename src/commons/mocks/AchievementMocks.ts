import {
  AchievementGoal,
  AchievementItem,
  GoalType
} from '../../features/achievement/AchievementTypes';
import { AND, EventTypes } from '../../features/achievement/ExpressionTypes';

export const mockAchievements: AchievementItem[] = [
  {
    uuid: '0',
    title: 'Rune Master',
    xp: 100,
    isVariableXp: false,
    isTask: true,
    position: 1,
    prerequisiteUuids: ['2', '1'],
    goalUuids: ['0'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/rune-master.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Rune Master achievement'
    }
  },
  {
    uuid: '1',
    title: 'Beyond the Second Dimension',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 7, 6, 12, 30, 0),
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: ['1'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/btsd.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Beyond the Second Dimension achievement'
    }
  },
  {
    uuid: '2',
    title: 'Colorful Carpet',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 7, 8, 9, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: ['2'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/colorful-carpet.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Colorful Carpet achievement'
    }
  },
  {
    uuid: '3',
    title: '',
    xp: 100,
    isVariableXp: false,
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: [],
    cardBackground: '',
    view: {
      coverImage: '',
      description: '',
      completionText: ''
    }
  },
  {
    uuid: '4',
    title: 'Curve Wizard',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 8, 15, 0, 0, 0),
    isTask: true,
    position: 4,
    prerequisiteUuids: ['5', '6'],
    goalUuids: ['3'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/curve-wizard.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Wizard achievement'
    }
  },
  {
    uuid: '5',
    title: 'Curve Introduction',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 7, 28, 0, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: ['4'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/curve-introduction.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Introduction achievement'
    }
  },
  {
    uuid: '6',
    title: 'Curve Manipulation',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 8, 5, 0, 0, 0),
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: ['5'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/curve-manipulation.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Curve Manipulation achievement'
    }
  },
  {
    uuid: '21',
    title: 'The Source-rer',
    xp: 100,
    isVariableXp: false,
    deadline: new Date(2020, 7, 21, 0, 0, 0),
    isTask: true,
    position: 3,
    prerequisiteUuids: [],
    goalUuids: ['16', '18'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/the-source-rer.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed The Source-rer achievement'
    }
  },
  {
    uuid: '8',
    title: 'Power of Friendship',
    xp: 100,
    isVariableXp: false,
    isTask: true,
    position: 2,
    prerequisiteUuids: ['9'],
    goalUuids: [],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/power-of-friendship.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Power of Friendship achievement'
    }
  },
  {
    uuid: '9',
    title: 'Piazza Guru',
    xp: 100,
    isVariableXp: false,
    isTask: false,
    position: 0,
    prerequisiteUuids: [],
    goalUuids: ['8'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/piazza-guru.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Piazza Guru achievement'
    }
  },
  {
    uuid: '16',
    title: "That's the Spirit",
    xp: 100,
    isVariableXp: false,
    isTask: true,
    position: 5,
    prerequisiteUuids: [],
    goalUuids: ['14'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/thats-the-spirit.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: "Congratulations! You have completed That's the Spirit achievement"
    }
  },
  {
    uuid: '13',
    title: 'Kool Kidz',
    xp: 100,
    isVariableXp: false,
    isTask: true,
    position: 6,
    prerequisiteUuids: [],
    goalUuids: ['11'],
    cardBackground:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-background/default.png',
    view: {
      coverImage:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/cover-image/default.png',
      description: 'Diz for teh K00L K1dz',
      completionText: 'U SO G00D'
    }
  }
];

export const mockGoals: AchievementGoal[] = [
  {
    uuid: '0',
    text: 'Bonus for completing Colorful Carpet & Beyond the Second Dimension Achievements',
    meta: {
      type: GoalType.BINARY,
      condition: AND(
        { event: EventTypes.ASSESSMENT_GRADING, restriction: 'M2A' },
        { event: EventTypes.ASSESSMENT_GRADING, restriction: 'M2B' }
      ),
      targetCount: 100
    },
    count: 0,
    targetCount: 100,
    completed: false,
    achievementUuids: ['0']
  },
  {
    uuid: '1',
    text: 'XP earned from Beyond the Second Dimension Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 1,
      requiredCompletionFrac: 0.5
    },
    count: 213,
    targetCount: 250,
    completed: true,
    achievementUuids: ['1']
  },
  {
    uuid: '2',
    text: 'XP earned from Colorful Carpet Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 2,
      requiredCompletionFrac: 0.8
    },
    count: 0,
    targetCount: 250,
    completed: false,
    achievementUuids: ['2']
  },
  {
    uuid: '3',
    text: 'Bonus for completing Curve Introduction & Curve Manipulation Achievements',
    meta: {
      type: GoalType.BINARY,
      condition: AND(
        {
          event: EventTypes.ASSESSMENT_GRADING,
          restriction: 'M3'
        },
        {
          event: EventTypes.ASSESSMENT_GRADING,
          restriction: 'M4A'
        }
      ),
      targetCount: 100
    },
    count: 0,
    targetCount: 100,
    completed: false,
    achievementUuids: ['4']
  },
  {
    uuid: '4',
    text: 'XP earned from Curve Introduction Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 3,
      requiredCompletionFrac: 0.5
    },
    count: 178,
    targetCount: 250,
    completed: true,
    achievementUuids: ['5']
  },
  {
    uuid: '5',
    text: 'XP earned from Curve Manipulation Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 4,
      requiredCompletionFrac: 0.8
    },
    count: 191,
    targetCount: 250,
    completed: false,
    achievementUuids: ['6']
  },
  {
    uuid: '16',
    text: 'Submit Source 3 Path',
    meta: {
      type: GoalType.BINARY,
      condition: {
        event: EventTypes.ASSESSMENT_SUBMISSION,
        restriction: 'P3'
      },
      targetCount: 100
    },
    count: 100,
    targetCount: 100,
    completed: true,
    achievementUuids: ['21']
  },
  {
    uuid: '18',
    text: 'XP earned from Source 3 Path',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 5,
      requiredCompletionFrac: 1
    },
    count: 300,
    targetCount: 300,
    completed: true,
    achievementUuids: ['21']
  },
  {
    uuid: '8',
    text: 'Each Top Voted answer in Piazza gives 10 XP',
    meta: {
      type: GoalType.MANUAL,
      targetCount: 100
    },
    count: 40,
    targetCount: 100,
    completed: false,
    achievementUuids: ['9']
  },
  {
    uuid: '14',
    text: 'Submit 1 PR to Source Academy Github',
    meta: {
      type: GoalType.MANUAL,
      targetCount: 100
    },
    count: 100,
    targetCount: 100,
    completed: true,
    achievementUuids: ['16']
  },
  {
    uuid: '11',
    text: 'Be the Koolest Kidz in SOC by redeeming this 100 XP achievement yourself',
    meta: {
      type: GoalType.BINARY,
      condition: false,
      targetCount: 100
    },
    count: 0,
    targetCount: 100,
    completed: false,
    achievementUuids: ['13']
  }
];
