import { describe, expect, test } from 'vitest';

import {
  CONDUCTOR_E_STEPPER_TAB_ID,
  CONDUCTOR_STEPPER_TAB_ID,
  isConductorStepperTab,
  isToolEvaluator,
} from './stepperTab';

describe('isToolEvaluator', () => {
  test.each(['stepper', 'e-stepper', 'cse', 'ev3'])('a %s evaluator is a tool evaluator', cap => {
    expect(isToolEvaluator({ capabilities: [cap] })).toBe(true);
  });

  test('an ordinary evaluator is not', () => {
    expect(isToolEvaluator({ capabilities: [] })).toBe(false);
    expect(isToolEvaluator({})).toBe(false);
  });
});

describe('isConductorStepperTab', () => {
  test('the Stepper and E-Stepper tabs are stepper tabs', () => {
    expect(isConductorStepperTab(CONDUCTOR_STEPPER_TAB_ID)).toBe(true);
    expect(isConductorStepperTab(CONDUCTOR_E_STEPPER_TAB_ID)).toBe(true);
  });

  test('other tabs are not', () => {
    expect(isConductorStepperTab('cseMachine')).toBe(false);
    expect(isConductorStepperTab(undefined)).toBe(false);
  });
});
