import * as Sentry from '@sentry/react';
import { describe, expect, test, vi } from 'vitest';

import { recordLegacyUsage } from './legacyUsage';

vi.mock('@sentry/react', () => ({ metrics: { count: vi.fn() } }));

describe('recordLegacyUsage', () => {
  test('counts one use of the named compatibility path', () => {
    recordLegacyUsage('share-link-chapter');
    expect(Sentry.metrics.count).toHaveBeenCalledExactlyOnceWith('legacy.usage', 1, {
      attributes: { kind: 'share-link-chapter' },
    });
  });
});
