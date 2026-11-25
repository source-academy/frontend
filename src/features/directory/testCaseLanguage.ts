import type { OverallState } from '../../commons/application/ApplicationTypes';
import type { IProgrammingQuestion } from '../../commons/assessment/AssessmentTypes';
import { resolveLibraryLanguage } from './libraryLanguage';

/** What of a question decides its languages. */
type QuestionLanguages = Pick<IProgrammingQuestion, 'library' | 'frontendGradingLibrary'>;

/**
 * The question that a workspace shows: of the graded submission (grading workspace), or of the
 * assessment (assessment workspace, which Mission Control's editing workspace shares).
 */
function activeQuestion(
  state: OverallState,
  workspaceLocation: 'grading' | 'assessment' | string,
): Partial<QuestionLanguages> | undefined {
  if (workspaceLocation === 'grading') {
    const { currentSubmission, currentQuestion } = state.workspaces.grading;
    const answers =
      currentSubmission === undefined
        ? undefined
        : state.session.gradings[currentSubmission]?.answers;
    const question = answers?.[currentQuestion ?? 0]?.question;
    return question && 'library' in question ? question : undefined;
  }
  if (workspaceLocation === 'assessment') {
    const { currentAssessment, currentQuestion } = state.workspaces.assessment;
    const questions =
      currentAssessment === undefined
        ? undefined
        : state.session.assessments[currentAssessment]?.questions;
    return questions?.[currentQuestion ?? 0];
  }
  return undefined;
}

/**
 * The language and evaluator that the test cases of a workspace run under (the frontend grader), or
 * `undefined` if the question does not name one that the language directory has. There is no default
 * language: nothing is guessed for a question that names none, and the global selection, which
 * belongs to whichever page set it last, plays no part.
 *
 * The question that the workspace shows names them by `frontendGradingLibrary` (which the backend
 * fills in from its grading library, and that from the user's, when the assessment does not say), or
 * else by its `library` (source-academy/backend#1387): by `language` and `evaluator`, or, for a
 * question saved before those, by the `chapter`, a position in the directory (see
 * `resolveLibraryLanguage`).
 */
export function selectTestCaseLanguage(
  state: OverallState,
  workspaceLocation: string,
): { languageId: string; evaluatorId: string } | undefined {
  const question = activeQuestion(state, workspaceLocation);
  return resolveLibraryLanguage(
    state.languageDirectory.languages,
    question?.frontendGradingLibrary ?? question?.library,
  );
}
