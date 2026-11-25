import { describe, expect, test } from 'vitest';

import { isToolEvaluator } from './toolEvaluators';

describe('isToolEvaluator', () => {
  test('an evaluator that names a plugin is a tool evaluator', () => {
    expect(isToolEvaluator({ plugin: 'stepper' })).toBe(true);
    expect(isToolEvaluator({ plugin: 'anything-else', capabilities: [] })).toBe(true);
  });

  test.each(['cse', 'ev3'])('a %s evaluator is a tool evaluator', cap => {
    expect(isToolEvaluator({ capabilities: [cap] })).toBe(true);
  });

  test('an ordinary evaluator is not', () => {
    expect(isToolEvaluator({ capabilities: [] })).toBe(false);
    expect(isToolEvaluator({})).toBe(false);
  });

  test('the stepper capabilities alone no longer make one: the plugin does', () => {
    expect(isToolEvaluator({ capabilities: ['stepper'] })).toBe(false);
    expect(isToolEvaluator({ capabilities: ['e-stepper'] })).toBe(false);
  });
});
