import { AssessmentCategory, IQuestion, MCQChoice } from '../../assessment/assessmentShape';

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  assessmentId: number;
  assessmentName: string;
  assessmentCategory: AssessmentCategory;
  initialGrade: number;
  gradeAdjustment: number;
  currentGrade: number;
  maxGrade: number;
  initialXp: number;
  xpBonus: number;
  xpAdjustment: number;
  currentXp: number;
  maxXp: number;
  studentId: number;
  studentName: string;
  submissionId: number;
  groupName: string;
};

/**
 * The information fetched before
 * grading a submission.
 */
export type Grading = GradingQuestion[];

/**
 * Encapsulates information regarding grading a
 * particular question in a submission.
 */
export type GradingQuestion = {
  question: IAnsweredQuestion;
  student: {
    name: string;
    id: number;
  };
  grade: {
    comment: string;
    grade: number;
    gradeAdjustment: number;
    xp: number;
    xpAdjustment: number;
  };
};

/**
 * A Question to be shown when a trainer is
 * grading a submission. This means that
 * either of (library & solutionTemplate) xor (choices) must
 * be present, and either of (solution) xor (answer) must be present.
 *
 * @property comment This property is already present in GradingQuestion,
 *   and thus does not need to be used here, and is set to null
 * @property solution this can be either the answer to the MCQ, the solution to
 *   a programming question, or null.
 */
interface IAnsweredQuestion extends IQuestion {
  comment: null;
  solution: number | string | null;
  answer: string | number | null;
  maxGrade: number;
  maxXp: number;
  solutionTemplate?: string;
  choices?: MCQChoice[];
}
