import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagDirectoryLanguageUrl = createFeatureFlag(
  'directory.language.url',
  'https://source-academy.github.io/language-directory/directory.json',
  'The URL where the language directory may be found.'
);

export const selectDirectoryLanguageUrl = featureSelector(flagDirectoryLanguageUrl);
