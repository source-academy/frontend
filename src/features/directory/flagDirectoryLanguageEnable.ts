import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagDirectoryLanguageEnable = createFeatureFlag(
  'directory.language.enable',
  false,
  'Enable new language directory powered selection UI and runtime selection.'
);

export const selectDirectoryLanguageEnable = featureSelector(flagDirectoryLanguageEnable);
