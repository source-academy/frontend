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
interface IAssessmentOverview {
  category: AssessmentCategory
  coverImage: string
  close_at: Date
  id: number
  maximumEXP: number
  open_at: Date
  order: number
  summary_short: string
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
interface IAssessment extends IAssessmentOverview {
  category: AssessmentCategory
  id: number
  missionPDF: string
  questions: Question[]
  summary_long: string
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

interface IQuestion {
  id: number
  solutionTemplate: string
  library: Library
  content: string
  type: QuestionType
}

/* The two kinds of Questions available */
type QuestionType = 'programming' | 'mcq'

type Library = {
  chapter: number
  externals: string[]
  files: string[]
  globals: string[]
}
