import { AchievementAbility, AchievementItem } from '../achievement/AchievementTypes';

export const mockAchievements: AchievementItem[] = [
  {
    id: 0,
    title: 'Rune Master',
    ability: AchievementAbility.CORE,
    isTask: true,
    prerequisiteIds: [2, 1],
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
    position: 1,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/rune-master-tile.png',
    modal: {
      modalImageUrl:
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
    deadline: new Date(2020, 7, 21, 0, 0, 0),
    release: new Date(2020, 7, 17, 0, 0, 0),
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
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/btsd-tile.png',
    modal: {
      modalImageUrl:
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
    deadline: new Date(2020, 7, 16, 0, 0, 0),
    release: new Date(2020, 7, 12, 0, 0, 0),
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
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/colorful-carpet-tile.png',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: 'Congratulations! You have completed Colorful Carpet achievement'
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
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/annotated-canvas.png',
      description: '',
      completionText: ''
    }
  },
  {
    id: 4,
    title: 'Curve Wizard',
    ability: AchievementAbility.CORE,
    deadline: new Date(2020, 8, 15, 0, 0, 0),
    release: new Date(2020, 8, 1, 0, 0, 0),
    isTask: true,
    prerequisiteIds: [5, 6],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Curve Introduction mission',
        goalProgress: 120,
        goalTarget: 250
      },
      {
        goalId: 1,
        goalText: 'Complete Curve Manipulation mission',
        goalProgress: 50,
        goalTarget: 250
      },
      {
        goalId: 2,
        goalText: 'Bonus for completing Curve Wizard achievement',
        goalProgress: 0,
        goalTarget: 100
      }
    ],
    position: 4,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-wizard-tile.png',
    modal: {
      modalImageUrl:
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
    release: new Date(2020, 7, 24, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Curve Introduction mission',
        goalProgress: 50,
        goalTarget: 50
      },
      {
        goalId: 1,
        goalText: 'Score earned from Curve Introduction mission',
        goalProgress: 70,
        goalTarget: 200
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-introduction-tile.png',
    modal: {
      modalImageUrl:
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
    release: new Date(2020, 8, 1, 0, 0, 0),
    isTask: false,
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Curve Manipulation mission',
        goalProgress: 50,
        goalTarget: 50
      },
      {
        goalId: 1,
        goalText: 'Score earned from Curve Manipulation mission',
        goalProgress: 0,
        goalTarget: 200
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/curve-manipulation-tile.png',
    modal: {
      modalImageUrl:
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
    release: new Date(2020, 7, 17, 0, 0, 0),
    isTask: true,
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Source 3 path',
        goalProgress: 100,
        goalTarget: 100
      },
      {
        goalId: 1,
        goalText: 'Score earned from Source 3 path',
        goalProgress: 89,
        goalTarget: 300
      }
    ],
    position: 3,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/the-source-rer-tile.png',
    modal: {
      modalImageUrl:
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
    prerequisiteIds: [9],
    goals: [
      {
        goalId: 0,
        goalText: 'Complete Piazza Guru achievement',
        goalProgress: 40,
        goalTarget: 100
      }
    ],
    position: 2,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/power-of-friendship-tile.png',
    modal: {
      modalImageUrl:
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
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Each Top Voted answer in Piazza gives 10 XP',
        goalProgress: 40,
        goalTarget: 100
      }
    ],
    position: 0,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/piazza-guru-tile.png',
    modal: {
      modalImageUrl:
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
    prerequisiteIds: [],
    goals: [
      {
        goalId: 0,
        goalText: 'Submit 1 PR to Source Academy Github',
        goalProgress: 100,
        goalTarget: 100
      }
    ],
    position: 5,
    backgroundImageUrl:
      'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/card-tile/thats-the-spirit-tile.png',
    modal: {
      modalImageUrl:
        'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/achievement/canvas/sample-canvas.png',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
      completionText: "Congratulations! You have completed That's the Spirit achievement"
    }
  }
];
