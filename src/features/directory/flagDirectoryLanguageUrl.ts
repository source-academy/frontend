import { put } from 'redux-saga/effects';

import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import Constants from '../../commons/utils/Constants';
import LanguageDirectoryActions from './LanguageDirectoryActions';

const { enable, languageDirectoryUrl } = Constants.conductorConfig;

export const flagDirectoryLanguageUrl = createFeatureFlag(
  'directory.language.url',
  'https://source-academy.github.io/language-directory/directory.json',
  'The URL where the language directory may be found.',
  enable ? languageDirectoryUrl : undefined,
  function* () {
    yield put(LanguageDirectoryActions.fetchLanguages());
  },
);

export const selectDirectoryLanguageUrl = featureSelector(flagDirectoryLanguageUrl);
