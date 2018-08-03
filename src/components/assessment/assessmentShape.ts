/*
 * Used to display information regarding an assessment in the UI.
 */
export interface IAssessmentOverview {
  category: AssessmentCategory
  closeAt: string
  coverImage: string
  id: number
  maximumGrade: number
  openAt: string
  title: string
  shortSummary: string
  status: AssessmentStatus
  story: string | null
}

export enum AssessmentStatuses {
  not_attempted = 'not_attempted',
  attempting = 'attempting',
  attempted = 'attempted',
  submitted = 'submitted'
}

export type AssessmentStatus = keyof typeof AssessmentStatuses

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
  answer: string | null
  solutionTemplate: string
  type: 'programming'
}

export interface IMCQQuestion extends IQuestion {
  answer: number | null
  choices: MCQChoice[]
  type: 'mcq'
}

export interface IQuestion {
  answer: string | number | null
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

type ExternalLibrary = {
  name: ExternalLibraryName
  symbols: string[]
}

export type Library = {
  chapter: number
  external: ExternalLibrary
  globals: Array<[string, any]>
}
