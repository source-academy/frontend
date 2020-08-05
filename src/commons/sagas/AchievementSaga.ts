import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import {
  EDIT_ACHIEVEMENT,
  EDIT_GOAL,
  GET_ACHIEVEMENTS,
  GET_GOALS,
  GET_OWN_GOALS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL,
  UPDATE_GOAL_PROGRESS
} from '../../features/achievement/AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import {
  editAchievement,
  getOwnGoals,
  getGoals,
  getAchievements,
  removeAchievement,
  removeGoal,
  editGoal,
  updateGoalProgress
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* AchievementSaga(): SagaIterator {
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

  yield takeEvery(REMOVE_ACHIEVEMENT, function* (
    action: ReturnType<typeof actions.removeAchievement>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievement = action.payload;

    const resp = yield call(removeAchievement, achievement, tokens);

    if (!resp) {
      return;
    }
  });

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

  yield takeEvery(UPDATE_GOAL_PROGRESS, function* (
    action: ReturnType<typeof actions.updateGoalProgress>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const { studentId, progress } = action.payload;

    const resp = yield call(updateGoalProgress, studentId, progress, tokens);

    if (!resp) {
      return;
    }
  });
}
