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
