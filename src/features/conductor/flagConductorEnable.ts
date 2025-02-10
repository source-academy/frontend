import { createFeatureFlag } from 'src/commons/featureFlags';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  false,
  'Enables the Conductor framework for evaluation of user programs.'
);
