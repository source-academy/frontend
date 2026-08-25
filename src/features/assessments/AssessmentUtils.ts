import { stringify } from 'js-slang/dist/utils/stringify';

import { Role } from '../../commons/application/ApplicationTypes';
import {
  type AssessmentOverview,
  AssessmentStatuses,
  type IMCQQuestion,
  type Question,
  QuestionTypes,
  type Testcase,
} from '../../commons/assessment/AssessmentTypes';
import { beforeNow } from '../../commons/utils/DateHelper';
import { showWarningMessage } from '../../commons/utils/notifications/NotificationsHelper';

/**
 * Whether the user may save answers: students cannot once the submission is finalised
 * or past the close date; staff/admin always can.
 */
export const canSaveAssessment = (
  role: Role | undefined,
  overview: AssessmentOverview,
): boolean =>
  role !== Role.Student ||
  (overview.status !== AssessmentStatuses.submitted && !beforeNow(overview.closeAt));

/**
 * Returns a nullary function that defers the navigation of the browser window, until the
 * student's answer passes some checks - presently only used for assessments types with blocking = true
 * (previously used for the 'Path' assessment type in SA Knight)
 */
export const onClickProgress = (
  deferredNavigate: () => void,
  question: Question,
  testcases: Testcase[],
  isBlocked: boolean,
) => {
  return () => {
    if (!isBlocked) {
      return deferredNavigate();
    }
    // Else evaluate its correctness - proceed iff the answer to the current question is correct
    if (question.type === QuestionTypes.mcq) {
      // Note that 0 is a falsy value!
      if (question.answer === null) {
        return showWarningMessage('Please select an option!', 750);
      }
      // If the question is 'blocking', but there is no MCQ solution provided (i.e. assessment uploader's
      // mistake), allow the student to proceed after selecting an option
      if ((question as IMCQQuestion).solution === undefined) {
        return deferredNavigate();
      }
      if (question.answer !== (question as IMCQQuestion).solution) {
        return showWarningMessage('Your MCQ solution is incorrect!', 750);
      }
    } else if (question.type === QuestionTypes.programming) {
      const isCorrect = testcases.reduce((acc, testcase) => {
        return acc && stringify(testcase.result) === testcase.answer;
      }, true);
      if (!isCorrect) {
        return showWarningMessage('Your solution has not passed all testcases!', 750);
      }
    }
    return deferredNavigate();
  };
};
