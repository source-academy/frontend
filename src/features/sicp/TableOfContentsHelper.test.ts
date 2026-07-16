import { describe, expect, test } from 'vitest';

import { getNext, getPrev } from './TableOfContentsHelper';

const tocNavigation = {
  '1': { next: '2' },
  '2': { next: '3', prev: '1' },
  '3': { prev: '2' },
} as const;

describe('Table of contents helper', () => {
  test('generate next correctly', () => {
    expect(getNext(tocNavigation, '1')).toBe('2');
    expect(getNext(tocNavigation, '2')).toBe('3');
    expect(getNext(tocNavigation, '3')).toBeUndefined();
  });

  test('generate prev correctly', () => {
    expect(getPrev(tocNavigation, '1')).toBeUndefined();
    expect(getPrev(tocNavigation, '2')).toBe('1');
    expect(getPrev(tocNavigation, '3')).toBe('2');
  });

  test('handle invalid values correctly', () => {
    expect(getNext(tocNavigation, 'invalid')).toBeUndefined();
    expect(getNext(tocNavigation, '')).toBeUndefined();

    expect(getPrev(tocNavigation, 'invalid')).toBeUndefined();
    expect(getPrev(tocNavigation, '')).toBeUndefined();
  });
});
