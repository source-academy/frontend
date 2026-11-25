import { describe, expect, test } from 'vitest';

import { formatValue } from './formatValue';

describe('formatValue', () => {
  test.each([
    [42, '42'],
    [true, 'true'],
    [null, 'null'],
    [undefined, 'undefined'],
    ['a "b"', '"a \\"b\\""'],
    [[1, [2, null]], '[1, [2, null]]'],
    [{ a: 1, b: 'x' }, '{a: 1, b: "x"}'],
    [10n, '10'],
  ])('%s', (value, text) => {
    expect(formatValue(value)).toBe(text);
  });

  test('cuts a structure that contains itself', () => {
    const xs: unknown[] = [1];
    xs.push(xs);
    expect(formatValue(xs)).toBe('[1, ...<circular>]');
  });

  test('shows the missing slots of a sparse array', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(formatValue([1, , 3])).toBe('[1, undefined, 3]');
    expect(formatValue(new Array(1))).toBe('[undefined]');
  });

  test('cuts a value nested deeper than the limit instead of exhausting the stack', () => {
    let deep: unknown = 'bottom';
    for (let i = 0; i < 100000; i++) {
      deep = [deep];
    }
    const text = formatValue(deep);
    expect(text.startsWith('[[[')).toBe(true);
    expect(text).toContain('...<truncated>');
    expect(text.length).toBeLessThan(1000);
  });

  test('shows a shared, not circular, value in full each time', () => {
    const shared = [1];
    expect(formatValue([shared, shared])).toBe('[[1], [1]]');
  });
});
