import { describe, expect, test } from 'vitest';

import { flagConductorEnable } from './flagConductorEnable';

describe('flagConductorEnable', () => {
  test('enabling or disabling it has no side effect on other flags (e.g. the directory URLs)', () => {
    // Regression test: this flag previously force-set directory.language.url/directory.plugin.url
    // to local dev paths whenever enabled (and reset them whenever disabled) — a dev-only convenience
    // that leaked into production. Toggling it must not modify any other flag.
    expect(flagConductorEnable.onChange(true)).toBeUndefined();
    expect(flagConductorEnable.onChange(false)).toBeUndefined();
  });
});
