import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
  BULK_UPDATE_ACHIEVEMENTS,
  BULK_UPDATE_GOALS,
  EDIT_ACHIEVEMENT,
  EDIT_GOAL,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  GET_USERS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  UPDATE_GOAL_PROGRESS,
  UPDATE_OWN_GOAL_PROGRESS
} from '../../features/achievement/AchievementTypes';
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
    function* (action: ReturnType<typeof actions.bulkUpdateAchievements>) {
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
    function* (action: ReturnType<typeof actions.bulkUpdateGoals>) {
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

  yield takeEvery(EDIT_ACHIEVEMENT, function* (action: ReturnType<typeof actions.editAchievement>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievement = action.payload;

    const resp = yield call(editAchievement, achievement, tokens);

    if (!resp) {
      return;
    }
  });

  yield takeEvery(EDIT_GOAL, function* (action: ReturnType<typeof actions.editGoal>) {
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

  yield takeEvery(GET_ACHIEVEMENTS, function* () {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.saveAchievements(achievements));
    }
  });

  yield takeEvery(GET_GOALS, function* (action: ReturnType<typeof actions.getGoals>) {
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

  yield takeEvery(GET_OWN_GOALS, function* (action: ReturnType<typeof actions.getOwnGoals>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const goals = yield call(getOwnGoals, tokens);

    if (goals) {
      yield put(actions.saveGoals(goals));
    }
  });

  yield takeEvery(GET_USERS, function* (action: ReturnType<typeof actions.getUsers>) {
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
    function* (action: ReturnType<typeof actions.removeAchievement>) {
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

  yield takeEvery(REMOVE_GOAL, function* (action: ReturnType<typeof actions.removeGoal>) {
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
    function* (action: ReturnType<typeof actions.updateOwnGoalProgress>) {
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
    function* (action: ReturnType<typeof actions.updateGoalProgress>) {
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
}
