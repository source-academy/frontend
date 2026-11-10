import { describe, expect, test } from 'vitest';

import {
  TEST_CASE_EVALUATOR_ID,
  TEST_CASE_LANGUAGE_ID,
  testCaseLanguageFor,
} from './testCaseLanguage';

describe('testCaseLanguageFor', () => {
  test('Python §4 Typed grades under its typed evaluator, so that type errors count', () => {
    expect(testCaseLanguageFor('python4Typed')).toEqual({
      languageId: 'python4Typed',
      evaluatorId: 'python4TypedPy2js',
    });
  });

  test.each(['python1', 'python3', 'python4', 'pythonFull', 'source1', null, undefined])(
    'everything else grades under Python §4 (%s)',
    selected => {
      expect(testCaseLanguageFor(selected)).toEqual({
        languageId: TEST_CASE_LANGUAGE_ID,
        evaluatorId: TEST_CASE_EVALUATOR_ID,
      });
    },
  );
});
