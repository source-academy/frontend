import { SagaIterator } from 'redux-saga';
import { takeEvery, select, put, call } from 'redux-saga/effects';

import { actions } from '../utils/ActionsHelper';
import { GET_ACHIEVEMENTS, UPDATE_ACHIEVEMENTS } from './AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import { editAchievements, getAchievements } from '../sagas/RequestsSaga';

export default function* AchievementSaga(): SagaIterator {
  yield takeEvery(GET_ACHIEVEMENTS, function* () {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = yield call(getAchievements, tokens);

    if (achievements) {
      yield put(actions.editAchievements(achievements));
    }
  });

  yield takeEvery(UPDATE_ACHIEVEMENTS, function* (
    action: ReturnType<typeof actions.editAchievements>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const achievements = action.payload;

    const resp = yield call(editAchievements, achievements, tokens);

    if (!resp) {
      console.log(resp);
      return;
    }
  });
}
