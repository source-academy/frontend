import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { describe, expect, test } from 'vitest';

import type { OverallState } from '../application/ApplicationTypes';
import { createFeatureFlag } from '.';
import { useFeature } from './useFeature';

const renderUseFeature = <T,>(flag: Parameters<typeof useFeature<T>>[0], modifiedFlags: object) => {
  const store = createMockStore<OverallState>()({ featureFlags: { modifiedFlags } } as OverallState);
  return renderHook(() => useFeature(flag), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  }).result.current;
};

describe('useFeature', () => {
  test('returns the user override when the flag is unlocked', () => {
    const flag = createFeatureFlag('unlocked', 'default');
    expect(renderUseFeature(flag, { unlocked: 'override' })).toBe('override');
    expect(renderUseFeature(flag, {})).toBe('default');
  });

  test('returns the locked value regardless of the user override', () => {
    const flag = createFeatureFlag('locked', 'default', undefined, 'pinned');
    expect(renderUseFeature(flag, { locked: 'override' })).toBe('pinned');
    expect(renderUseFeature(flag, {})).toBe('pinned');
  });
});
