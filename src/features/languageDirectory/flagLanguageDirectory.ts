import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagLanguageDirectoryEnable = createFeatureFlag(
  'conductor.language.directory',
  false,
  'Enable new language directory powered selection UI and runtime selection.'
);

export const selectLanguageDirectoryEnable = featureSelector(flagLanguageDirectoryEnable);
