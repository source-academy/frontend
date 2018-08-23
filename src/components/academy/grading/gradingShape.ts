import { AssessmentCategory, IQuestion, MCQChoice } from '../../assessment/assessmentShape'

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  assessmentId: number
  assessmentName: string
  assessmentCategory: AssessmentCategory
  initialGrade: number
  gradeAdjustment: number
  currentGrade: number
  maxGrade: number
  initialXp: number
  xpAdjustment: number
  currentXp: number
  maxXp: number
  studentId: number
  studentName: string
  submissionId: number
}

/**
 * The information fetched before
 * grading a submission.
 */
export type Grading = GradingQuestion[]

/**
 * Encapsulates information regarding grading a
 * particular question in a submission.
 */
export type GradingQuestion = {
  question: IAnsweredQuestion
  maxGrade: number
  maxXp: number
  grade: {
    gradeAdjustment: number
    xpAdjustment: number
    comment: string
    grade: number
    xp: number
  }
}

/**
 * A Question to be shown when a trainer is
 * grading a submission. This means that
 * either of (library & solutionTemplate) xor (choices) must
 * be present, and either of (solution) xor (answer) must be present.
 *
 * @property comment This property is already present in GradingQuestion,
 *   and thus does not need to be used here, and is set to null
 */
interface IAnsweredQuestion extends IQuestion {
  comment: null
  solution?: number
  answer: string | number | null
  solutionTemplate?: string
  choices?: MCQChoice[]
}
