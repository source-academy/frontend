import {
  AchievementAbility,
  AchievementGoal,
  AchievementItem,
  GoalType
} from '../../features/achievement/AchievementTypes';
import { AND, EventTypes } from '../../features/achievement/ExpressionTypes';

export const mockAchievements: AchievementItem[] = [
  {
    uuid: '0',
    title: 'Rune Master',
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.CORE,
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
    ability: AchievementAbility.EFFORT,
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
    ability: AchievementAbility.COMMUNITY,
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
    ability: AchievementAbility.COMMUNITY,
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
    ability: AchievementAbility.EXPLORATION,
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
    ability: AchievementAbility.FLEX,
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
      maxXp: 100
    },
    xp: 0,
    maxXp: 100,
    completed: false
  },
  {
    uuid: '1',
    text: 'XP earned from Beyond the Second Dimension Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 'M2B',
      requiredCompletionFrac: 0.5
    },
    xp: 213,
    maxXp: 250,
    completed: true
  },
  {
    uuid: '2',
    text: 'XP earned from Colorful Carpet Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 'M2A',
      requiredCompletionFrac: 0.8
    },
    xp: 0,
    maxXp: 250,
    completed: false
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
      maxXp: 100
    },
    xp: 0,
    maxXp: 100,
    completed: false
  },
  {
    uuid: '4',
    text: 'XP earned from Curve Introduction Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 'M3',
      requiredCompletionFrac: 0.5
    },
    xp: 178,
    maxXp: 250,
    completed: true
  },
  {
    uuid: '5',
    text: 'XP earned from Curve Manipulation Mission',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 'M4A',
      requiredCompletionFrac: 0.8
    },
    xp: 191,
    maxXp: 250,
    completed: false
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
      maxXp: 100
    },
    xp: 100,
    maxXp: 100,
    completed: true
  },
  {
    uuid: '18',
    text: 'XP earned from Source 3 Path',
    meta: {
      type: GoalType.ASSESSMENT,
      assessmentNumber: 'P3',
      requiredCompletionFrac: 1
    },
    xp: 300,
    maxXp: 300,
    completed: true
  },
  {
    uuid: '8',
    text: 'Each Top Voted answer in Piazza gives 10 XP',
    meta: {
      type: GoalType.MANUAL,
      maxXp: 100
    },
    xp: 40,
    maxXp: 100,
    completed: false
  },
  {
    uuid: '14',
    text: 'Submit 1 PR to Source Academy Github',
    meta: {
      type: GoalType.MANUAL,
      maxXp: 100
    },
    xp: 100,
    maxXp: 100,
    completed: true
  },
  {
    uuid: '11',
    text: 'Be the Koolest Kidz in SOC by redeeming this 100 XP achievement yourself',
    meta: {
      type: GoalType.BINARY,
      condition: false,
      maxXp: 100
    },
    xp: 0,
    maxXp: 100,
    completed: false
  }
];
