import { describe, expect, test } from 'vitest';

import type { CseSnapshot } from '../conductor/CseMachineHostPlugin';
import { continuesRun } from './continuesRun';

const snapshot = (stepIndex: number): CseSnapshot => ({
  stepIndex,
  control: [],
  stash: [],
  environments: [{ id: 'g', name: 'global', parentId: null, bindings: [], isActive: true }],
});
const run = (n: number) => Array.from({ length: n }, (_, i) => snapshot(i));

describe('continuesRun', () => {
  test('a longer list that starts with the very snapshots of the shorter is the same run', () => {
    const first = run(10);
    expect(continuesRun(first, [...first, snapshot(10), snapshot(11)])).toBe(true);
  });

  test('so is a list as long as the one before (nothing new yet)', () => {
    const first = run(10);
    expect(continuesRun(first, [...first])).toBe(true);
  });

  test('there is no run before the first snapshots', () => {
    expect(continuesRun(null, run(10))).toBe(false);
    expect(continuesRun([], run(10))).toBe(false);
  });

  test('the same program run again is a new run, even with snapshots that look the same', () => {
    expect(continuesRun(run(10), run(20))).toBe(false);
    expect(continuesRun(run(10), run(10))).toBe(false);
  });

  test('a shorter list is a new run', () => {
    const first = run(10);
    expect(continuesRun(first, first.slice(0, 5))).toBe(false);
  });

  test('a list that shares only its first snapshot with the one before is a new run', () => {
    const first = run(10);
    expect(continuesRun(first, [first[0], ...run(15).slice(1)])).toBe(false);
  });
});
