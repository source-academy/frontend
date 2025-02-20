import { createFeatureFlag } from 'src/commons/featureFlags';
import { featureSelector } from 'src/commons/featureFlags/featureSelector';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  false,
  'Enables the Conductor framework for evaluation of user programs.'
);

export const selectConductorEnable = featureSelector(flagConductorEnable);
