import { SagaIterator } from 'redux-saga';
import { takeEvery, select, put, call } from 'redux-saga/effects';

import { actions } from '../utils/ActionsHelper';
import {
  GET_ACHIEVEMENTS,
  UPDATE_ACHIEVEMENTS,
  ADD_ACHIEVEMENT,
  EDIT_ACHIEVEMENT,
  DELETE_ACHIEVEMENT
} from './AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import {
  updateAchievements,
  getAchievements,
  addAchievement,
  editAchievement,
  deleteAchievement
} from '../sagas/RequestsSaga';

export default function* AchievementSaga(): SagaIterator {
  yield takeEvery(GET_ACHIEVEMENTS, function* () {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.updateAchievements(achievements));
    }
  });

  yield takeEvery(UPDATE_ACHIEVEMENTS, function* (
    action: ReturnType<typeof actions.updateAchievements>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = action.payload;

    const resp = yield call(updateAchievements, achievements, tokens);

    if (!resp) {
      return;
    }
  });

  yield takeEvery(ADD_ACHIEVEMENT, function* (action: ReturnType<typeof actions.addAchievement>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievement = action.payload;

    const resp = yield call(addAchievement, achievement, tokens);

    if (!resp) {
      return;
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

  yield takeEvery(DELETE_ACHIEVEMENT, function* (
    action: ReturnType<typeof actions.deleteAchievement>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievement = action.payload;

    const resp = yield call(deleteAchievement, achievement, tokens);

    if (!resp) {
      return;
    }
  });
}
