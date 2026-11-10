/**
 * Testcase grading always runs under this language/evaluator, regardless of what an
 * assessment's own languageId/evaluatorId (or the student's Playground selection)
 * happens to be - the student's own Run stays confined to their assigned sub-chapter,
 * but grading needs the full language so prepend/postpend content isn't itself
 * restricted by the student's sub-chapter. A sub-chapter's own syntax restrictions
 * (e.g. recursion-only, no loops) are therefore not enforced by the evaluator during
 * grading; a postpend that needs to check the student didn't use a disallowed
 * construct can do so itself via the chapter-4 parse() builtin (see runTestCase.ts's
 * __program__ injection).
 */
export const TEST_CASE_LANGUAGE_ID = 'python4';
export const TEST_CASE_EVALUATOR_ID = 'python4Py2js';

/**
 * Python §4 Typed is the exception: its test cases run under the typed evaluator, so that the program
 * (the student's code together with the test case) is type-checked, and a type error fails the test
 * case. Plain Python §4 rejects type annotations.
 */
export const TYPED_TEST_CASE_LANGUAGE_ID = 'python4Typed';
export const TYPED_TEST_CASE_EVALUATOR_ID = 'python4TypedPy2js';

/** The language and evaluator that test cases run under, for the language that is selected. */
export function testCaseLanguageFor(selectedLanguageId: string | null | undefined): {
  languageId: string;
  evaluatorId: string;
} {
  return selectedLanguageId === TYPED_TEST_CASE_LANGUAGE_ID
    ? { languageId: TYPED_TEST_CASE_LANGUAGE_ID, evaluatorId: TYPED_TEST_CASE_EVALUATOR_ID }
    : { languageId: TEST_CASE_LANGUAGE_ID, evaluatorId: TEST_CASE_EVALUATOR_ID };
}
