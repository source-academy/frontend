import { put } from 'redux-saga/effects';

import { createFeatureFlag, FeatureFlagsActions } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';
import { flagDirectoryLanguageUrl } from '../directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../directory/flagDirectoryPluginUrl';

export const flagConductorEnable = createFeatureFlag(
  'conductor.enable',
  false,
  'Enables the Conductor framework for evaluation of user programs.',
  function* (enabled: boolean) {
    if (!enabled) {
      // Restore the production remote directories.
      yield put(FeatureFlagsActions.resetFlag({ featureFlag: flagDirectoryLanguageUrl }));
      yield put(FeatureFlagsActions.resetFlag({ featureFlag: flagDirectoryPluginUrl }));
    }
  },
);

export const selectConductorEnable = featureSelector(flagConductorEnable);
