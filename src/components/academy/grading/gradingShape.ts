import { IMCQQuestion, IProgrammingQuestion, AssessmentCategory } from '../../assessment/assessmentShape'

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
  question: IAnsweredQuestion, 
  maximumXP": 0,
  grade: {
    xp: 0,
    comment: "string"
  }
}

interface IAnsweredQuestion extends IMCQQuestion, IProgrammingQuestion {
  solution: number,
  answer: string | number
}

