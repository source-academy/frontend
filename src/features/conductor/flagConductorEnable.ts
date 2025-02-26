import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  false,
  'Enables the Conductor framework for evaluation of user programs.'
);

export const selectConductorEnable = featureSelector(flagConductorEnable);
