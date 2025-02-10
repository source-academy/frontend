import { SagaIterator } from 'redux-saga';
import { select } from 'redux-saga/effects';

import { FeatureFlag } from './FeatureFlag';

export function* selectFeature<T>(featureFlag: FeatureFlag<T>): SagaIterator<T> {
  const { flagName, defaultValue } = featureFlag;
  const flagValue = yield select(state => state.featureFlags.modifiedFlags[flagName]);
  return flagValue ?? defaultValue;
}
