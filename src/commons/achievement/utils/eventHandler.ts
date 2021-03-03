import { getOwnGoals, updateGoalProgress } from '../../../features/achievement/AchievementActions';
import { store } from '../../../pages/createStore';

export function incrementFirstMaxXp() {
  store.dispatch(getOwnGoals());
  const goals = store.getState().achievement.goals;
  const progress = {
    uuid: goals[0].uuid, 
    xp: goals[0].xp + 1, 
    maxXp: goals[0].maxXp, 
    completed: goals[0].completed
  }
  const userId = store.getState().session.userId;
  userId && store.dispatch(updateGoalProgress(userId, progress));
}