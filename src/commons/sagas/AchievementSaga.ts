import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import {
  EDIT_ACHIEVEMENT,
  GET_ACHIEVEMENTS,
  REMOVE_ACHIEVEMENT,
  REMOVE_GOAL
} from '../../features/achievement/AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import { editAchievement, getAchievements, removeAchievement, removeGoal } from './RequestsSaga';

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

    const { goal, achievement } = action.payload;

    const resp = yield call(removeGoal, goal, achievement, tokens);

    if (!resp) {
      return;
    }
  });
}
