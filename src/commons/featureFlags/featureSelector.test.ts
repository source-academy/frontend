import { describe, expect, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { createFeatureFlag } from '.';
import { featureSelector } from './featureSelector';

const makeState = (modifiedFlags: Record<string, unknown>) =>
  ({ featureFlags: { modifiedFlags } }) as OverallState;

describe('featureSelector', () => {
  test('preserves an explicitly disabled flag whose default is enabled', () => {
    const flag = createFeatureFlag('enabled-by-default', true);
    const selectFlag = featureSelector(flag);

    expect(selectFlag(makeState({ 'enabled-by-default': false }))).toBe(false);
    expect(selectFlag(makeState({}))).toBe(true);
  });

  test('preserves other explicit falsy values', () => {
    expect(featureSelector(createFeatureFlag('number', 1))(makeState({ number: 0 }))).toBe(0);
    expect(featureSelector(createFeatureFlag('text', 'default'))(makeState({ text: '' }))).toBe('');
  });
});
