import { SagaIterator } from 'redux-saga';
import { select } from 'redux-saga/effects';

import { FeatureFlag } from './FeatureFlag';
import { featureSelector } from './featureSelector';

export function* selectFeatureSaga<T>(featureFlag: FeatureFlag<T>): SagaIterator<T> {
  const { flagName, defaultValue } = featureFlag;
  const flagValue = yield select(featureSelector(flagName));
  return flagValue ?? defaultValue;
}
