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
  questions: IQuestion[]
  title: string
}

/* The different kinds of Assessments available */
export enum AssessmentCategories {
  Contest = 'Contest',
  Mission = 'Mission',
  Path = 'Path',
  Sidequest = 'Sidequest'
}
export type AssessmentCategory = keyof typeof AssessmentCategories

export interface IProgrammingQuestion extends IQuestion {
  library: Library
  solutionTemplate: string
  type: 'programming'
}

export interface IMCQQuestion extends IQuestion {
  choices: MCQChoice[]
  type: 'mcq'
}

export interface IQuestion {
  content: string
  id: number
  type: QuestionType
}

export type MCQChoice = {
  content: string
  hint: string
}

/* The two kinds of Questions available */
export enum QuestionTypes {
  programming = 'programming',
  mcq = 'mcq'
}
export type QuestionType = keyof typeof QuestionTypes

export type Library = {
  chapter: number
  externals: string[]
  files: string[]
  globals: string[]
}
