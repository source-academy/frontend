import { getOwnGoals, updateGoalProgress } from '../../../features/achievement/AchievementActions';
import {
  AchievementGoal,
  EventMeta,
  EventType,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';
import { store } from '../../../pages/createStore';

export function processEvent(eventName: string, increment: number = 1) {
  let goals = store.getState().achievement.goals;
  // if the state has goals, enter the function body
  // somehow if(goals) doesn't work, even though console.log(goals) prints out []
  if (goals[0]) {
    // expand on this switch statement if you want to add more events!
    switch (eventName) {
      case EventType.RUNCODE:
        goals = goals.filter(
          goal => goal.meta.type === GoalType.EVENT && goal.meta.eventName === EventType.RUNCODE
        );
        break;
      default:
        goals = [];
    }

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
      alert('User ID not defined!');
    }

    // future changes: xp should be count!
    goals.forEach(goal => {
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
    });
    // if goals are not in state, load the goals from the backend and try again
  } else {
    // ensure that the next function call has updated XP values
    store.dispatch(getOwnGoals());

    // naively wait for 1 second for the state to be updated
    // want: wait exactly until the store does get updated, how?

    // wait till the getOwnGoals completes and the goals are in the state, then try again
    const retry = () => processEvent(eventName, increment);
    setTimeout(retry, 1000); // arbitrary number of time to wait for the state to get the goals
  }
}
