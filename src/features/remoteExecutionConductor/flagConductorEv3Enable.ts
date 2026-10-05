import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import Constants from '../../commons/utils/Constants';

export const flagConductorEv3Enable = createFeatureFlag(
  'conductor.ev3.enable',
  false,
  'Enables the Conductor-based EV3 execution pipeline using py-slang.',
  Constants.conductorConfig.ev3Enable,
);

export const selectConductorEv3Enable = featureSelector(flagConductorEv3Enable);
