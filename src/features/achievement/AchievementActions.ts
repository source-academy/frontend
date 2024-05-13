import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import { createActions } from 'src/commons/redux/utils';

import {
  AchievementGoal,
  AchievementItem,
  AchievementUser,
  EventType,
  GoalDefinition,
  GoalProgress
} from './AchievementTypes';

const AchievementActions = createActions('achievement', {
  bulkUpdateAchievements: (achievements: AchievementItem[]) => achievements,
  bulkUpdateGoals: (goals: GoalDefinition[]) => goals,
  getAchievements: () => ({}),
  getGoals: (studentCourseRegId: number) => studentCourseRegId,
  getOwnGoals: () => ({}),
  getUserAssessmentOverviews: (studentCourseRegId: number) => studentCourseRegId,
  getUsers: () => ({}),
  removeAchievement: (uuid: string) => uuid,
  removeGoal: (uuid: string) => uuid,
  updateOwnGoalProgress: (progress: GoalProgress) => progress,
  addEvent: (eventNames: EventType[]) => eventNames,
  handleEvent: (loggedEvents: EventType[][]) => loggedEvents,
  updateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) => ({
    studentCourseRegId,
    progress
  }),
  /**
   * Note: This updates the frontend Achievement Redux store.
   * Please refer to AchievementReducer to find out more.
   */
  saveAchievements: (achievements: AchievementItem[]) => achievements,
  /**
   * Note: This updates the frontend Achievement Redux store.
   * Please refer to AchievementReducer to find out more.
   */
  saveGoals: (goals: AchievementGoal[]) => goals,
  /**
   * Note: This updates the frontend Achievement Redux store.
   * Please refer to AchievementReducer to find out more.
   */
  saveUsers: (users: AchievementUser[]) => users,
  /**
   * Note: This updates the frontend Achievement Redux store.
   * Please refer to AchievementReducer to find out more.
   */
  saveUserAssessmentOverviews: (assessmentOverviews: AssessmentOverview[]) => assessmentOverviews
});

// For compatibility with existing code (actions helper)
export default AchievementActions;
