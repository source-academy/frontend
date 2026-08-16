import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagConductorEv3Enable = createFeatureFlag(
  'conductor.ev3.enable',
  false,
  'Enables the Conductor-based EV3 execution pipeline using py-slang.',
);

export const selectConductorEv3Enable = featureSelector(flagConductorEv3Enable);
