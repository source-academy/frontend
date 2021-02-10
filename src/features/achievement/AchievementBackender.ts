import {
  AchievementItem,
  GoalDefinition,
  GoalProgress,
  GoalType
} from './AchievementTypes';

export const BackendifyAchievementItem = (achievement: AchievementItem) => 
  ({
    ...achievement,
    uuid: achievement.uuid.toString(), 
    prerequisiteUuids: achievement.prerequisiteUuids.map(uuid => uuid.toString()),
    goalUuids: achievement.goalUuids.map(uuid => uuid.toString()),
    deadline: achievement.deadline ? achievement.deadline.toString() : "",
    release: achievement.release ? achievement.release.toString() : ""
  });

export const BackendifyGoalDefinition = (goal: GoalDefinition) => 
  ({
    ...goal,
    uuid: goal.uuid.toString(),
    type: goal.meta.type,
    maxXp: (goal.meta.type === GoalType.ASSESSMENT) ? 0 : goal.meta.maxXp
  });

export const BackendifyGoalProgress = (goal: GoalProgress) => 
  ({
    ...goal,
    uuid: goal.uuid.toString()
  });