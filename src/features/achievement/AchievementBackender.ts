import { GoalDefinition, GoalProgress, GoalType } from './AchievementTypes';

export const backendifyGoalDefinition = (goal: GoalDefinition) => ({
  maxXp: goal.meta.type === GoalType.ASSESSMENT ? 0 : goal.meta.maxXp,
  meta: goal.meta,
  text: goal.text,
  type: goal.meta.type,
  uuid: goal.uuid
});

export const backendifyGoalProgress = (goal: GoalProgress) => ({
  ...goal,
  uuid: goal.uuid
});
