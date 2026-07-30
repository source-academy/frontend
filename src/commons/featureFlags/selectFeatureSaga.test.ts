import { expectSaga } from 'redux-saga-test-plan';
import { describe, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { createFeatureFlag } from '.';
import { selectFeatureSaga } from './selectFeatureSaga';

const makeState = (modifiedFlags: Record<string, unknown>) =>
  ({ featureFlags: { modifiedFlags } }) as OverallState;

describe('selectFeatureSaga', () => {
  test('returns the user override when the flag is unlocked', () =>
    expectSaga(selectFeatureSaga, createFeatureFlag('unlocked', 'default'))
      .withState(makeState({ unlocked: 'override' }))
      .returns('override')
      .silentRun());

  test('returns the locked value regardless of the user override', () =>
    expectSaga(
      selectFeatureSaga,
      createFeatureFlag('locked', 'default', undefined, 'pinned'),
    )
      .withState(makeState({ locked: 'override' }))
      .returns('pinned')
      .silentRun());
});
