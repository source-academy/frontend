import { AssessmentCategory, IQuestion, MCQChoice } from '../../assessment/assessmentShape'

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  assessmentId: number
  assessmentName: string
  assessmentCategory: AssessmentCategory
  currentXP: number
  graded: boolean
  maximumXP: number
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
  maximumXP: number
  grade: {
    xp: number
    comment: string
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
  answer?: string | number
  solutionTemplate?: string
  choices?: MCQChoice[]
}
