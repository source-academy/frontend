import { put } from 'redux-saga/effects';

import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import LanguageDirectoryActions from './LanguageDirectoryActions';

export const flagDirectoryLanguageUrl = createFeatureFlag(
  'directory.language.url',
  'https://source-academy.github.io/language-directory/directory.json',
  'The URL where the language directory may be found.',
  function* () {
    yield put(LanguageDirectoryActions.fetchLanguages());
  }
);

export const selectDirectoryLanguageUrl = featureSelector(flagDirectoryLanguageUrl);
