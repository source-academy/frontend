import { OverallState } from '../application/ApplicationTypes';
import { FeatureFlag } from './FeatureFlag';

export const featureSelector = (featureFlag: FeatureFlag<any>) => (state: OverallState) =>
  state.featureFlags.modifiedFlags[featureFlag.flagName];
