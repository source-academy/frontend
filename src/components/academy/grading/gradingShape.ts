import { AssessmentCategory, IQuestion, MCQChoice } from '../../assessment/assessmentShape'

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  adjustments: number
  assessmentId: number
  assessmentName: string
  assessmentCategory: AssessmentCategory
  initialGrade: number
  currentGrade: number
  maximumGrade: number
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
  maximumGrade: number
  grade: {
    adjustment: number
    comment: string
    grade: number
  }
}

/**
 * A Question to be shown when a trainer is
 * grading a submission. This means that
 * either of (library & solutionTemplate) xor (choices) must
 * be present, and either of (solution) xor (answer) must be present.
 */
interface IAnsweredQuestion extends IQuestion {
  solution?: number
  answer: string | number | null
  solutionTemplate?: string
  choices?: MCQChoice[]
}
