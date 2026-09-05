import { describe, expect, test } from 'vitest';

import { createFeatureFlag, FeatureFlagsActions, FeatureFlagsReducer } from '.';

describe('FeatureFlagsReducer', () => {
  test('setFlag stores the value of an unlocked flag', () => {
    const flag = createFeatureFlag('unlocked', true);
    const state = FeatureFlagsReducer(
      { modifiedFlags: {} },
      FeatureFlagsActions.setFlag({ featureFlag: flag, value: false }),
    );

    expect(state.modifiedFlags).toEqual({ unlocked: false });
  });

  test('setFlag on a locked flag does not write to persisted state', () => {
    const flag = createFeatureFlag('locked', true, undefined, true);
    const state = FeatureFlagsReducer(
      { modifiedFlags: {} },
      FeatureFlagsActions.setFlag({ featureFlag: flag, value: false }),
    );

    expect(state.modifiedFlags).toEqual({});
  });

  test('resetFlag clears the override of an unlocked flag', () => {
    const flag = createFeatureFlag('unlocked', true);
    const state = FeatureFlagsReducer(
      { modifiedFlags: { unlocked: false } },
      FeatureFlagsActions.resetFlag({ featureFlag: flag }),
    );

    expect(state.modifiedFlags).toEqual({});
  });

  test('resetFlag on a locked flag does not touch persisted state', () => {
    const flag = createFeatureFlag('locked', true, undefined, true);
    const state = FeatureFlagsReducer(
      { modifiedFlags: { locked: false } },
      FeatureFlagsActions.resetFlag({ featureFlag: flag }),
    );

    expect(state.modifiedFlags).toEqual({ locked: false });
  });
});
