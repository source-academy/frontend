import type { OverallState } from '../../commons/application/ApplicationTypes';
import { deriveLanguageFromChapter } from './chapterLanguage';

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

/**
 * The chapter of the question that a workspace shows: of the graded submission (grading workspace),
 * or of the assessment (assessment workspace, which Mission Control's editing workspace shares).
 */
function activeQuestionChapter(
  state: OverallState,
  workspaceLocation: 'grading' | 'assessment' | string,
): number | undefined {
  if (workspaceLocation === 'grading') {
    const { currentSubmission, currentQuestion } = state.workspaces.grading;
    const answers =
      currentSubmission === undefined
        ? undefined
        : state.session.gradings[currentSubmission]?.answers;
    const question = answers?.[currentQuestion ?? 0]?.question;
    return question && 'library' in question ? question.library?.chapter : undefined;
  }
  if (workspaceLocation === 'assessment') {
    const { currentAssessment, currentQuestion } = state.workspaces.assessment;
    const questions =
      currentAssessment === undefined
        ? undefined
        : state.session.assessments[currentAssessment]?.questions;
    return questions?.[currentQuestion ?? 0]?.library?.chapter;
  }
  return undefined;
}

/**
 * The language and evaluator that the test cases of a workspace run under. It is derived from the
 * question that the workspace shows (the language of its chapter), not from the global selection,
 * which belongs to whichever page set it last; the selection is the fallback, for a workspace whose
 * question is not known.
 */
export function selectTestCaseLanguage(
  state: OverallState,
  workspaceLocation: string,
): { languageId: string; evaluatorId: string } {
  const derived = deriveLanguageFromChapter(
    state.languageDirectory.languages,
    activeQuestionChapter(state, workspaceLocation),
  );
  return testCaseLanguageFor(derived?.languageId ?? state.languageDirectory.selectedLanguageId);
}
