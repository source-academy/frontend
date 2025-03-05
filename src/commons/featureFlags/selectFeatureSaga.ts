import { SagaIterator } from 'redux-saga';
import { select } from 'redux-saga/effects';

import { FeatureFlag } from './FeatureFlag';
import { featureSelector } from './featureSelector';

export function* selectFeatureSaga<T>(featureFlag: FeatureFlag<T>): SagaIterator<T> {
  const { defaultValue } = featureFlag;
  const flagValue = yield select(featureSelector(featureFlag));
  return flagValue ?? defaultValue;
}
