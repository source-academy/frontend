import { GoalDefinition, GoalType } from 'src/features/achievement/AchievementTypes';

export const goalTemplate: GoalDefinition = {
  id: 0,
  text: 'Goal Text Here',
  maxExp: 0,
  meta: {
    type: GoalType.MANUAL
  }
};
