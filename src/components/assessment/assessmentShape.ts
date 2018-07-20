/*
 * Used to display information regarding an assessment in the UI.
 */
export interface IAssessmentOverview {
  attempted: boolean
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
  library: Library
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

/** Constants for external library names */
export enum ExternalLibraryNames {
  NONE = 'NONE',
  TWO_DIM_RUNES = 'TWO_DIM_RUNES',
  THREE_DIM_RUNES = 'THREE_DIM_RUNES',
  CURVES = 'CURVES',
  SOUND = 'SOUND'
}

export type ExternalLibraryName = keyof typeof ExternalLibraryNames

export type Library = {
  chapter: number
  externalLibraryName: ExternalLibraryName
  files: string[]
  externals: string[]
  globals: string[]
}
