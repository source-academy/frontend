import {
  AchievementGoal,
  AchievementItem,
  GoalDefinition,
  GoalMeta,
  GoalType
} from '../../../features/achievement/AchievementTypes';

export const backendifyGoalDefinition = (goal: GoalDefinition) => ({
  targetCount: goal.meta.type === GoalType.ASSESSMENT ? 1 : goal.meta.targetCount,
  meta: goal.meta,
  text: goal.text,
  type: goal.meta.type,
  uuid: goal.uuid
});

export const frontendifyAchievementGoal = (goal: any) =>
  ({
    uuid: goal.uuid || '',
    text: goal.text || '',
    achievementUuids: goal.achievementUuids,
    meta: (goal.meta.type === 'Event'
      ? {
          ...goal.meta,
          release: goal.meta.release ? new Date(goal.meta.release) : undefined,
          deadline: goal.meta.deadline ? new Date(goal.meta.deadline) : undefined,
          observeFrom: goal.meta.observeFrom ? new Date(goal.meta.observeFrom) : undefined,
          observeTo: goal.meta.observeTo ? new Date(goal.meta.observeTo) : undefined
        }
      : goal.meta) as GoalMeta,
    count: goal.count,
    targetCount: goal.targetCount,
    completed: goal.count >= goal.targetCount
  }) as AchievementGoal;

export const frontendifyAchievementItem = (achievement: any) =>
  ({
    uuid: achievement.uuid || '',
    title: achievement.title || '',
    xp: achievement.xp,
    isVariableXp: achievement.isVariableXp,
    deadline: achievement.deadline === null ? undefined : new Date(achievement.deadline),
    release: achievement.release === null ? undefined : new Date(achievement.release),
    isTask: achievement.isTask,
    position: achievement.position,
    prerequisiteUuids: achievement.prerequisiteUuids,
    goalUuids: achievement.goalUuids,
    cardBackground: achievement.cardBackground || '',
    view: {
      coverImage: achievement.view.coverImage || '',
      completionText: achievement.view.completionText || '',
      description: achievement.view.description || ''
    }
  }) as AchievementItem;

export const backendifyAchievementItem = (achievement: AchievementItem) => ({
  ...achievement,
  deadline: achievement.deadline ? achievement.deadline : null,
  release: achievement.release ? achievement.release : null
});
