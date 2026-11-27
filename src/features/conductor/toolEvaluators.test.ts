import { describe, expect, test } from 'vitest';

import { isToolEvaluator } from './toolEvaluators';

describe('isToolEvaluator', () => {
  test('an evaluator that names a plugin is a tool evaluator', () => {
    expect(isToolEvaluator({ plugin: 'stepper' })).toBe(true);
    expect(isToolEvaluator({ plugin: 'anything-else', capabilities: [] })).toBe(true);
  });

  test('an ev3 evaluator is a tool evaluator', () => {
    expect(isToolEvaluator({ capabilities: ['ev3'] })).toBe(true);
  });

  test('the cse capability alone does not make one: the plugin does', () => {
    expect(isToolEvaluator({ capabilities: ['cse'] })).toBe(false);
    expect(isToolEvaluator({ capabilities: ['cse'], plugin: 'cse-machine' })).toBe(true);
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
