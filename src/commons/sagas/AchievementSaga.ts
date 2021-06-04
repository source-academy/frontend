import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
  AchievementGoal,
  BULK_UPDATE_ACHIEVEMENTS,
  BULK_UPDATE_GOALS,
  EDIT_ACHIEVEMENT,
  EDIT_GOAL,
  EventType,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GET_USERS,
  HANDLE_EVENT,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  UPDATE_GOAL_PROGRESS,
  UPDATE_OWN_GOAL_PROGRESS
} from '../../features/achievement/AchievementTypes';
import AchievementInferencer from '../achievement/utils/AchievementInferencer';
import { goalIncludesEvents, incrementCount } from '../achievement/utils/EventHandler';
import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import {
  bulkUpdateAchievements,
  bulkUpdateGoals,
  editAchievement,
  editGoal,
  getAchievements,
  getAllUsers,
  getGoals,
  getOwnGoals,
  removeAchievement,
  removeGoal,
  updateGoalProgress,
  updateOwnGoalProgress
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* AchievementSaga(): SagaIterator {
  yield takeEvery(
    BULK_UPDATE_ACHIEVEMENTS,
    function* (action: ReturnType<typeof actions.bulkUpdateAchievements>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const achievements = action.payload;

      const resp = yield call(bulkUpdateAchievements, achievements, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(
    BULK_UPDATE_GOALS,
    function* (action: ReturnType<typeof actions.bulkUpdateGoals>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const goals = action.payload;

      const resp = yield call(bulkUpdateGoals, goals, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(
    EDIT_ACHIEVEMENT,
    function* (action: ReturnType<typeof actions.editAchievement>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const achievement = action.payload;

      const resp = yield call(editAchievement, achievement, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(EDIT_GOAL, function* (action: ReturnType<typeof actions.editGoal>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const definition = action.payload;

    const resp = yield call(editGoal, definition, tokens);

    if (!resp) {
      return;
    }
  });

  yield takeEvery(GET_ACHIEVEMENTS, function* (): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.saveAchievements(achievements));
    }
  });

  yield takeEvery(GET_GOALS, function* (action: ReturnType<typeof actions.getGoals>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const studentId = action.payload;

    const goals = yield call(getGoals, tokens, studentId);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  });

  yield takeEvery(GET_OWN_GOALS, function* (action: ReturnType<typeof actions.getOwnGoals>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const goals = yield call(getOwnGoals, tokens);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  });

  yield takeEvery(GET_USERS, function* (action: ReturnType<typeof actions.getUsers>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToke: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const users = yield call(getAllUsers, tokens);

    if (users) {
      yield put(actions.saveUsers(users));
    }
  });

  yield takeEvery(
    REMOVE_ACHIEVEMENT,
    function* (action: ReturnType<typeof actions.removeAchievement>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const achievement = action.payload;

      const resp = yield call(removeAchievement, achievement, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(REMOVE_GOAL, function* (action: ReturnType<typeof actions.removeGoal>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const definition = action.payload;

    const resp = yield call(removeGoal, definition, tokens);

    if (!resp) {
      return;
    }
  });

  yield takeEvery(
    UPDATE_OWN_GOAL_PROGRESS,
    function* (action: ReturnType<typeof actions.updateOwnGoalProgress>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const progress = action.payload;

      const resp = yield call(updateOwnGoalProgress, progress, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(
    UPDATE_GOAL_PROGRESS,
    function* (action: ReturnType<typeof actions.updateGoalProgress>): any {
      const tokens = yield select((state: OverallState) => ({
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken
      }));

      const { studentId, progress } = action.payload;

      const resp = yield call(updateGoalProgress, studentId, progress, tokens);

      if (!resp) {
        return;
      }
    }
  );

  yield takeEvery(HANDLE_EVENT, function* (action: ReturnType<typeof actions.handleEvent>): any {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    // get the most recent list of achievements
    const backendAchievements = yield call(getAchievements, tokens);
    if (backendAchievements) {
      yield put(actions.saveAchievements(backendAchievements));
    }

    // get the goals and their progress from the backend
    const backendGoals = yield call(getOwnGoals, tokens);
    if (backendGoals) {
      yield put(actions.saveGoals(backendGoals));
    } else {
      // if there are no goals, handling events will do nothing
      return;
    }

    const achievements = yield select((state: OverallState) => state.achievement.achievements);
    const goals = yield select((state: OverallState) => state.achievement.goals);

    const inferencer = new AchievementInferencer(achievements, goals);
    const loggedEvents: EventType[][] = action.payload;

    const updatedGoals = new Set<string>();

    loggedEvents.forEach((events: EventType[]) => {
      const eventGoalUuids = goals
        .filter((goal: AchievementGoal) => goalIncludesEvents(goal, events))
        .map((goal: AchievementGoal) => goal.uuid);
      eventGoalUuids.forEach((uuid: string) => {
        incrementCount(uuid, inferencer);
        updatedGoals.add(uuid);
      });
    });

    for (const uuid of updatedGoals) {
      const resp = yield call(updateOwnGoalProgress, inferencer.getGoalProgress(uuid), tokens);

      if (!resp) {
        return;
      }
    }
  });
}
