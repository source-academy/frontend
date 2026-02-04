import { createSlice } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';

import { FeatureFlag } from './FeatureFlag';

export type FeatureFlagsState = {
  modifiedFlags: Record<string, any>;
};

export const defaultFeatureFlags = {
  modifiedFlags: {}
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState: defaultFeatureFlags,
  reducers: {
    setFlag<T>(
      state: FeatureFlagsState,
      action: { payload: { featureFlag: FeatureFlag<T>; value: T } }
    ) {
      state.modifiedFlags[action.payload.featureFlag.flagName] = action.payload.value;
    },
    resetFlag<T>(state: FeatureFlagsState, action: { payload: { featureFlag: FeatureFlag<T> } }) {
      delete state.modifiedFlags[action.payload.featureFlag.flagName];
    }
  }
});

export const FeatureFlagsActions = featureFlagsSlice.actions;

export const FeatureFlagsReducer = featureFlagsSlice.reducer;

export function createFeatureFlag<T>(
  flagName: string,
  defaultValue: T,
  flagDesc?: string,
  callback?: (newValue: T) => SagaIterator
): FeatureFlag<T> {
  return new FeatureFlag<T>(flagName, defaultValue, flagDesc, callback);
}
