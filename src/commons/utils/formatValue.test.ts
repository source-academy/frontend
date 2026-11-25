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

  test('shows a shared, not circular, value in full each time', () => {
    const shared = [1];
    expect(formatValue([shared, shared])).toBe('[[1], [1]]');
  });
});
