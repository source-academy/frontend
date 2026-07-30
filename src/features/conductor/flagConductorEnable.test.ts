import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { OverallState } from '../../commons/application/ApplicationTypes';
import Constants from '../../commons/utils/Constants';
import { flagConductorEnable } from './flagConductorEnable';

const emptyState = { featureFlags: { modifiedFlags: {} } } as OverallState;

describe('flagConductorEnable pinned on by the deployment', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('../../commons/utils/Constants', () => ({
      default: { ...Constants, conductorConfig: { ...Constants.conductorConfig, enable: true } },
    }));
  });

  test('is enabled outside of SICP JS', async () => {
    window.history.pushState({}, '', '/playground');
    const { selectConductorEnable } = await import('./flagConductorEnable');

    expect(selectConductorEnable(emptyState)).toBe(true);
  });

  test('stays disabled on SICP JS, whose snippets are not Conductor-based', async () => {
    window.history.pushState({}, '', '/sicpjs/2.2');
    const { selectConductorEnable } = await import('./flagConductorEnable');

    expect(selectConductorEnable(emptyState)).toBe(false);
  });
});

describe('flagConductorEnable', () => {
  test('enabling or disabling it has no side effect on other flags (e.g. the directory URLs)', () => {
    // Regression test: this flag previously force-set directory.language.url/directory.plugin.url
    // to local dev paths whenever enabled (and reset them whenever disabled) — a dev-only convenience
    // that leaked into production. Toggling it must not modify any other flag.
    expect(flagConductorEnable.onChange(true)).toBeUndefined();
    expect(flagConductorEnable.onChange(false)).toBeUndefined();
  });
});
