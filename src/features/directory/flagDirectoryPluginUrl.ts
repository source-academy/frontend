import { put } from 'redux-saga/effects';

import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import PluginDirectoryActions from './PluginDirectoryActions';

export const flagDirectoryPluginUrl = createFeatureFlag(
  'directory.plugin.url',
  'https://source-academy.github.io/plugin-directory/directory.json',
  'The URL where the plugin directory may be found.',
  function* () {
    yield put(PluginDirectoryActions.fetchPlugins());
  }
);

export const selectDirectoryPluginUrl = featureSelector(flagDirectoryPluginUrl);
