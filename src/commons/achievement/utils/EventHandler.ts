import {
  AchievementGoal,
  AchievementItem,
  EventMeta,
  EventType,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';
import { showSuccessMessage } from '../../utils/notifications/NotificationsHelper';
import AchievementInferencer from './AchievementInferencer';
import { isExpired, isReleased, isWithinTimeRange } from './DateHelper';

function eventShouldCount(meta: EventMeta): boolean {
  // goal is not released, or has expired
  if (isExpired(meta.deadline) || !isReleased(meta.release)) {
    return false;
  }
  if (isWithinTimeRange(meta.observeFrom, meta.observeTo)) {
    return true;
  }
  return false;
}

export function incrementCount(goalUuid: string, inferencer: AchievementInferencer) {
  const progress: GoalProgress = { ...inferencer.getGoalProgress(goalUuid) };
  progress.count = progress.count + 1;
  const wasCompleted = progress.completed;
  progress.completed = progress.count >= progress.targetCount;

  const incompleteAchievements: string[] = [];
  if (!wasCompleted && progress.completed) {
    const achievements: string[] = inferencer.getAchievementsByGoal(goalUuid);
    for (const achievement of achievements) {
      if (!inferencer.isCompleted(inferencer.getAchievement(achievement))) {
        incompleteAchievements.push(achievement);
      }
    }
  }

  inferencer.modifyGoalProgress(progress);

  for (const achievementUuid of incompleteAchievements) {
    const achievement: AchievementItem = inferencer.getAchievement(achievementUuid);
    if (inferencer.isCompleted(achievement)) {
      showSuccessMessage('Completed acheivement: ' + achievement.title);
    }
  }
}

export function goalIncludesEvents(goal: AchievementGoal, eventNames: EventType[]) {
  if (goal.meta.type === GoalType.EVENT && eventShouldCount(goal.meta)) {
    for (let i = 0; i < goal.meta.eventNames.length; i++) {
      for (let j = 0; j < eventNames.length; j++) {
        if (goal.meta.eventNames[i] === eventNames[j]) {
          return true;
        }
      }
    }
  }
  return false;
}
