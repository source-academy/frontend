export interface IMissionOverview extends IAssessmentOverview {
  category: 'Mission'
}
export interface ISidequestOverview extends IAssessmentOverview {
  category: 'Sidequest'
}
export interface IPathOverview extends IAssessmentOverview {
  category: 'Path'
}
export interface IContestOverview extends IAssessmentOverview {
  category: 'Contest'
}

/*
 * Used to display information regarding an assessment in the UI.
 */
export interface IAssessmentOverview {
  category: AssessmentCategory
  coverImage: string
  closeAt: string
  id: number
  maximumEXP: number
  openAt: string
  order: number
  shortSummary: string
  title: string
}

export interface IMission extends IAssessment {
  category: 'Mission'
}
export interface ISidequest extends IAssessment {
  category: 'Sidequest'
}
export interface IPath extends IAssessment {
  category: 'Path'
}
export interface IContest extends IAssessment {
  category: 'Contest'
}

/*
 * Used when an assessment is being actively attempted/graded.
 */
export interface IAssessment {
  category: AssessmentCategory
  id: number
  missionPDF: string
  questions: IQuestion[]
  longSummary: string
  title: string
}

/* The different kinds of Assessments available */
type AssessmentCategory = 'Mission' | 'Sidequest' | 'Path' | 'Contest'

export interface IProgrammingQuestion extends IQuestion {
  type: 'programming'
}
export interface IMCQQuestion extends IQuestion {
  type: 'mcq'
}

type MCQChoice = {
  hint: string
  content: string
}
export interface IQuestion {
  id: number
  solutionTemplate?: string
  library?: Library
  content: string
  type: QuestionType
  choices?: MCQChoice[]
}

/* The two kinds of Questions available */
type QuestionType = 'programming' | 'mcq'

export type Library = {
  chapter: number
  externals: string[]
  files: string[]
  globals: string[]
}
