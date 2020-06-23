import { SagaIterator } from 'redux-saga';
import { takeEvery, select, put, call } from 'redux-saga/effects';

import { actions } from '../utils/ActionsHelper';
import { GET_ACHIEVEMENTS } from './AchievementTypes';
import { OverallState } from '../application/ApplicationTypes';
import { getAchievements } from '../sagas/RequestsSaga';

export default function* AchievementSaga(): SagaIterator {
  yield takeEvery(GET_ACHIEVEMENTS, function* (action: ReturnType<typeof actions.getAchievements>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentOverviews = yield call(getAchievements, tokens);
    if (assessmentOverviews) {
      yield put(actions.getAchievements());
    }
  });
}
