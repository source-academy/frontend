import { call } from 'redux-saga/effects';

import { FeatureFlagsActions } from '../featureFlags';
import { combineSagaHandlers } from '../redux/utils';

const FeatureFlagSaga = combineSagaHandlers({
  [FeatureFlagsActions.setFlag.type]: function* ({ payload: { featureFlag, value } }) {
    yield call([featureFlag, 'onChange'], value);
  },
  [FeatureFlagsActions.resetFlag.type]: function* ({ payload: { featureFlag } }) {
    yield call([featureFlag, 'onChange'], featureFlag.defaultValue);
  }
});

export default FeatureFlagSaga;
