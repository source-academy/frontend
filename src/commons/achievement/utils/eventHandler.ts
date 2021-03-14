import {
  getAchievements,
  getOwnGoals,
  updateGoalProgress
} from '../../../features/achievement/AchievementActions';
import {
  AchievementGoal,
  EventConditions,
  EventMeta,
  EventType,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';
import { store } from '../../../pages/createStore';
import AchievementInferencer from './AchievementInferencer';

function eventConditionSatisfied(meta: EventMeta): boolean {
  // short circuit for those that have no condition to fulfil
  if (meta.condition.type === EventConditions.NONE) {
    return true;
  } else {
    const leftBound = meta.condition.leftBound;
    const rightBound = meta.condition.rightBound;
    const currentDate = new Date();
    switch (meta.condition.type) {
      case EventConditions.TIME:
        const currentTime = currentDate.getHours() * 100 + currentDate.getMinutes();

        // happens when, for example, leftBound = 2300, rightBound = 0100
        if (leftBound >= rightBound) {
          return currentTime <= rightBound || currentTime >= leftBound;
        } else {
          return currentTime <= rightBound && currentTime >= leftBound;
        }
      case EventConditions.DATETIME:
        // YYYYMMDDHHMM - terrible implementation tbh
        const currentDatetime =
          currentDate.getFullYear() * 100000000 +
          (currentDate.getMonth() + 1) * 1000000 +
          currentDate.getDate() * 10000 +
          currentDate.getHours() * 100 +
          currentDate.getMinutes();

        return currentDatetime <= rightBound && currentDatetime >= leftBound;
      default:
        // shouldn't ever reach here, only in cases of invalid condition
        return false;
    }
  }
}

let inferencer: AchievementInferencer = new AchievementInferencer(
  store.getState().achievement.achievements,
  store.getState().achievement.goals
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
  let goals = inferencer.getAllGoals();

  // if the state has goals, enter the function body
  if (goals[0]) {
    goals = goals.filter(goal => goalIncludesEvent(goal, eventName));

    const computeCompleted = (goal: AchievementGoal): boolean => {
      // all goals that are input as arguments are eventGoals
      const meta = goal.meta as EventMeta;
      if (!goal.completed && goal.xp + increment >= meta.targetCount) {
        // replace with a nice notification in the future
        alert('Completed acheivement: ' + goal.text);
        return true;
      } else {
        return goal.completed;
      }
    };

    const userId = store.getState().session.userId;
    // not sure what to do in this case...
    if (!userId) {
      return;
    }

    // future changes: xp should be count!
    goals.forEach(goal => {
      if (eventConditionSatisfied(goal.meta as EventMeta)) {
        // edit the version that is on the state
        goal.completed = computeCompleted(goal);
        goal.xp = goal.xp + increment;

        // send the update request to the backend
        const progress: GoalProgress = {
          uuid: goal.uuid,
          xp: goal.xp, // user gets all of this xp, even if its not complete
          maxXp: goal.maxXp, // when complete, the user gets the xp
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
