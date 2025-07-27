import { describe, test, expect } from 'vitest';

describe('Vitest Migration Test', () => {
  test('basic functionality works', () => {
    expect(1 + 1).toBe(2);
  });

  test('string operations work', () => {
    expect('hello world'.toUpperCase()).toBe('HELLO WORLD');
  });
});