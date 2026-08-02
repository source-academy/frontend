import type { OverallState } from '../application/ApplicationTypes';
import { FeatureFlag } from './FeatureFlag';

export function featureSelector<T>(featureFlag: FeatureFlag<T>) {
  return (state: OverallState) =>
    (featureFlag.lockedValue ??
      state.featureFlags.modifiedFlags[featureFlag.flagName] ??
      featureFlag.defaultValue) as T;
}
