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
export type AssessmentCategory = 'Mission' | 'Sidequest' | 'Path' | 'Contest'
export enum AssessmentCategories {
  MISSION = 'Mission',
  SIDEQUEST = 'Sidequest',
  PATH = 'Path',
  CONTEST = 'Contest'
}

export interface IProgrammingQuestion extends IQuestion {
  type: 'programming'
  solutionTemplate: string
  library: Library
}

export interface IMCQQuestion extends IQuestion {
  type: 'mcq'
  choices?: MCQChoice[]
}

export interface IQuestion {
  id: number
  content: string
  type: QuestionType
}

type MCQChoice = {
  hint: string
  content: string
}

/* The two kinds of Questions available */
type QuestionType = 'programming' | 'mcq'

export type Library = {
  chapter: number
  externals: string[]
  files: string[]
  globals: string[]
}
