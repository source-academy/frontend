import { vi } from 'vitest';

import { getNext, getPrev } from '../TableOfContentsHelper';

vi.mock('../data/toc-navigation.json', () => ({
  default: {
    '1': { next: '2' },
    '2': { next: '3', prev: '1' },
    '3': { prev: '2' }
  }
}));

describe('Table of contents helper', () => {
  test('generate next correctly', () => {
    expect(getNext('1')).toBe('2');
    expect(getNext('2')).toBe('3');
    expect(getNext('3')).toBeUndefined();
  });

  test('generate prev correctly', () => {
    expect(getPrev('1')).toBeUndefined();
    expect(getPrev('2')).toBe('1');
    expect(getPrev('3')).toBe('2');
  });

  test('handle invalid values correctly', () => {
    expect(getNext('invalid')).toBeUndefined();
    expect(getNext('')).toBeUndefined();

    expect(getPrev('invalid')).toBeUndefined();
    expect(getPrev('')).toBeUndefined();
  });
});
