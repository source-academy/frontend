import { put } from 'redux-saga/effects';

import { createFeatureFlag, FeatureFlagsActions } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import { flagDirectoryLanguageUrl } from '../directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../directory/flagDirectoryPluginUrl';

/** Local directory paths served by the frontend dev server / production build. */
const LOCAL_LANGUAGE_DIR = '/languages/directory.json';
const LOCAL_PLUGIN_DIR = '/plugins/directory.json';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  false,
  'Enables the Conductor framework for evaluation of user programs.',
  function* (enabled: boolean) {
    if (enabled) {
      // Switch to the locally-served stepper evaluators and web plugin.
      yield put(
        FeatureFlagsActions.setFlag({
          featureFlag: flagDirectoryLanguageUrl,
          value: LOCAL_LANGUAGE_DIR,
        }),
      );
      yield put(
        FeatureFlagsActions.setFlag({
          featureFlag: flagDirectoryPluginUrl,
          value: LOCAL_PLUGIN_DIR,
        }),
      );
    } else {
      // Restore the production remote directories.
      yield put(FeatureFlagsActions.resetFlag({ featureFlag: flagDirectoryLanguageUrl }));
      yield put(FeatureFlagsActions.resetFlag({ featureFlag: flagDirectoryPluginUrl }));
    }
  },
);

export const selectConductorEnable = featureSelector(flagConductorEnable);
