import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import { updateSupportedLanguages } from './language';

export const flagLangDirUrl = createFeatureFlag(
  'langdir.url',
  'https://source-academy.github.io/language-directory/directory.json',
  'The URL where Source Academy may find the language directory.',
  newUrl => updateSupportedLanguages(newUrl)
);

export const selectLangDirUrl = featureSelector(flagLangDirUrl);
