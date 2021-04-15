import {
  getAchievements,
  getOwnGoals,
  updateGoalProgress
} from '../../../features/achievement/AchievementActions';
import {
  AchievementGoal,
  EventMeta,
  EventType,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';
import { store } from '../../../pages/createStore';
import { showSuccessMessage } from '../../utils/NotificationsHelper';
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

let inferencer: AchievementInferencer = new AchievementInferencer(
  store ? store.getState().achievement.achievements : [],
  store ? store.getState().achievement.goals : []
);

const goalIncludesEvent = (goal: AchievementGoal, eventName: EventType) => {
  if (goal.meta.type === GoalType.EVENT) {
    for (let i = 0; i < goal.meta.eventNames.length; i++) {
      if (goal.meta.eventNames[i] === eventName) {
        return true;
      }
    }
    return false;
  } else {
    return false;
  }
};

export function processEvent(eventName: EventType, increment: number = 1) {
  // by default, userId should be the current state's one
  const userId = store.getState().session.userId;
  // just in case userId is still not defined
  if (!userId) {
    return;
  }

  let goals = inferencer.getAllGoals();

  // if the inferencer has goals, enter the function body
  if (goals[0]) {
    goals = goals.filter(goal => goalIncludesEvent(goal, eventName));

    const computeCompleted = (goal: AchievementGoal): boolean => {
      // all goals that are input as arguments are eventGoals
      const meta = goal.meta as EventMeta;

      // if the goal just became completed
      if (!goal.completed && goal.count + increment >= meta.targetCount) {
        goal.completed = true;
        const parentAchievements = inferencer.getAchievementsByGoal(goal.uuid);
        parentAchievements.forEach(uuid => {
          const completed = inferencer
            .getAchievement(uuid)
            .goalUuids.map(goalUuid => inferencer.getGoal(goalUuid).completed)
            .reduce((completion, goalCompletion) => completion && goalCompletion, true);
          if (completed) {
            showSuccessMessage('Completed acheivement: ' + inferencer.getAchievement(uuid).title);
          }
        });
        return true;
      } else {
        return goal.completed;
      }
    };

    goals.forEach(goal => {
      if (eventShouldCount(goal.meta as EventMeta)) {
        // edit the version that is on the state
        computeCompleted(goal);
        goal.count = goal.count + increment;

        // send the update request to the backend
        const progress: GoalProgress = {
          uuid: goal.uuid,
          count: goal.count, // user gets all of this xp, even if its not complete
          targetCount: goal.targetCount, // when complete, the user gets the xp
          // check for completion using counter that gets incremented
          completed: goal.completed
        };

        // update goal progress in the backend
        userId && store.dispatch(updateGoalProgress(userId, progress));
      }
    });
    // if goals are not in state, load the goals from the backend and try again
  } else {
    const retry = () => {
      inferencer = new AchievementInferencer(
        store.getState().achievement.achievements,
        store.getState().achievement.goals
      );
      processEvent(eventName, increment);
    };

    if (!store.getState().achievement.goals[0]) {
      // ensure that the next function call has updated XP values
      store.dispatch(getOwnGoals());
      store.dispatch(getAchievements());

      // naively wait for 1 second for the state to be updated
      // want: wait exactly until the store does get updated, how?

      // wait till the getOwnGoals completes and the goals are in the state, then try again
      setTimeout(retry, 1000); // arbitrary number of time to wait for the state to get the goals
    } else {
      // state already has the goals and achievements
      retry();
    }
  }
}
