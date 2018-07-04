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
