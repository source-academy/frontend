import { GoalDefinition, GoalType } from '../../../features/achievement/AchievementTypes';

export const backendifyGoalDefinition = (goal: GoalDefinition) => ({
  targetCount: goal.meta.type === GoalType.ASSESSMENT ? 1 : goal.meta.targetCount,
  meta: goal.meta,
  text: goal.text,
  type: goal.meta.type,
  uuid: goal.uuid,
  achievementUuids: goal.achievementUuids
});
