import { GoalDefinition, GoalType } from 'src/features/achievement/AchievementTypes';

export const goalTemplate: GoalDefinition = {
  id: 0,
  text: 'Goal Text Here',
  meta: {
    type: GoalType.MANUAL,
    maxExp: 0
  }
};
