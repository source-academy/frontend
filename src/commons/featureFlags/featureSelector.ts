import { OverallState } from '../application/ApplicationTypes';
import { FeatureFlag } from './FeatureFlag';

export function featureSelector<T>(featureFlag: FeatureFlag<T>) {
  return (state: OverallState) =>
    (state.featureFlags.modifiedFlags[featureFlag.flagName] || featureFlag.defaultValue) as T;
}
