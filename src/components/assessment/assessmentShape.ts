/*
 * Used to display information regarding an assessment in the UI.
 */
export interface IAssessmentOverview {
  category: AssessmentCategory
  closeAt: string
  coverImage: string
  id: number
  maximumEXP: number
  openAt: string
  order: number
  shortSummary: string
  title: string
}

/*
 * Used when an assessment is being actively attempted/graded.
 */
export interface IAssessment {
  category: AssessmentCategory
  id: number
  longSummary: string
  missionPDF: string
  questions: Array<IProgrammingQuestion | IMCQQuestion>
  title: string
}

/* The different kinds of Assessments available */
export type AssessmentCategory = 'Contest' | 'Mission' | 'Path' | 'Sidequest'
export enum AssessmentCategories {
  CONTEST = 'Contest',
  MISSION = 'Mission',
  PATH = 'Path',
  SIDEQUEST = 'Sidequest'
}

export interface IProgrammingQuestion extends IQuestion {
  library: Library
  solutionTemplate: string
  type: 'programming'
}

export interface IMCQQuestion extends IQuestion {
  choices?: MCQChoice[]
  type: 'mcq'
}

export interface IQuestion {
  content: string
  id: number
  type: QuestionType
}

type MCQChoice = {
  content: string
  hint: string
}

/* The two kinds of Questions available */
type QuestionType = 'programming' | 'mcq'

export type Library = {
  chapter: number
  externals: string[]
  files: string[]
  globals: string[]
}
