import { put } from 'redux-saga/effects';

import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import Constants from '../../commons/utils/Constants';
import PluginDirectoryActions from './PluginDirectoryActions';

const { enable, pluginDirectoryUrl } = Constants.conductorConfig;

export const flagDirectoryPluginUrl = createFeatureFlag(
  'directory.plugin.url',
  'https://source-academy.github.io/plugins/directory.json',
  'The URL where the plugin directory may be found.',
  enable ? pluginDirectoryUrl : undefined,
  function* () {
    yield put(PluginDirectoryActions.fetchPlugins());
  },
);

export const selectDirectoryPluginUrl = featureSelector(flagDirectoryPluginUrl);
