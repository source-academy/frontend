import {
  AchievementItem,
  GoalDefinition,
  GoalProgress,
  GoalType
} from './AchievementTypes';

export const BackendifyAchievementItem = (achievement: AchievementItem) => 
  ({
    ability: achievement.ability,
    cardBackground: achievement.cardBackground,
    deadline: achievement.deadline ? achievement.deadline.toString() : "",
    goalUuids: achievement.goalUuids.map(uuid => uuid.toString()),
    isTask: achievement.isTask,
    position: achievement.position,
    prerequisiteUuids: achievement.prerequisiteUuids.map(uuid => uuid.toString()),
    release: achievement.release ? achievement.release.toString() : "",
    title: achievement.title,
    uuid: achievement.uuid.toString(), 
    view: achievement.view
  });

export const BackendifyGoalDefinition = (goal: GoalDefinition) => 
  ({
    maxXp: (goal.meta.type === GoalType.ASSESSMENT) ? 0 : goal.meta.maxXp,
    meta: goal.meta,
    text: goal.text,
    type: goal.meta.type,
    uuid: goal.uuid.toString()
  });

export const BackendifyGoalProgress = (goal: GoalProgress) => 
  ({
    ...goal,
    uuid: goal.uuid.toString()
  });