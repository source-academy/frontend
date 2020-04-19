import { SourceError, Variant } from 'js-slang/dist/types';

/*
 * Used to display information regarding an assessment in the UI.
 *
 * @property closeAt an ISO 8601 compliant date string specifiying when
 *   the assessment closes
 * @property openAt an ISO 8601 compliant date string specifiying when
 *   the assessment opens
 */
export interface IAssessmentOverview {
  category: AssessmentCategory;
  closeAt: string;
  coverImage: string;
  fileName?: string; // For mission control
  grade: number;
  id: number;
  maxGrade: number;
  maxXp: number;
  number?: string; // For mission control
  openAt: string;
  title: string;
  reading?: string; // For mission control
  shortSummary: string;
  status: AssessmentStatus;
  story: string | null;
  xp: number;
  gradingStatus: GradingStatus;
  private?: boolean;
  isPublished?: boolean;
}

export enum AssessmentStatuses {
  not_attempted = 'not_attempted',
  attempting = 'attempting',
  attempted = 'attempted',
  submitted = 'submitted'
}

export type AssessmentStatus = keyof typeof AssessmentStatuses;

export enum GradingStatuses {
  none = 'none',
  grading = 'grading',
  graded = 'graded',
  excluded = 'excluded'
}

export type GradingStatus = keyof typeof GradingStatuses;

/*
 * Used when an assessment is being actively attempted/graded.
 */
export interface IAssessment {
  category: AssessmentCategory;
  globalDeployment?: Library; // For mission control
  graderDeployment?: Library; // For mission control
  id: number;
  longSummary: string;
  missionPDF: string;
  questions: IQuestion[];
  title: string;
}

/* The different kinds of Assessments available */
export enum AssessmentCategories {
  Contest = 'Contest',
  Mission = 'Mission',
  Path = 'Path',
  Sidequest = 'Sidequest',
  Practical = 'Practical'
}

export type AssessmentCategory = keyof typeof AssessmentCategories;

export interface IProgrammingQuestion extends IQuestion {
  answer: string | null;
  autogradingResults: AutogradingResult[];
  prepend: string;
  solutionTemplate: string;
  postpend: string;
  testcases: ITestcase[];
  testcasesPrivate?: ITestcase[]; // For mission control
  type: 'programming';
  graderTemplate?: string;
}

/* The different types of testcases available */
export enum TestcaseTypes {
  // These are rendered in full by the Mission Autograder
  public = 'public',
  // These are rendered with a placeholder by the Autograder
  hidden = 'hidden',
  // These should only exist in the grading workspace for submissions
  private = 'private'
}

export type TestcaseType = keyof typeof TestcaseTypes;

export interface ITestcase {
  type: TestcaseType;
  answer: string; // the correct answer to the testcase
  score: number;
  program: string; // the program to be appended to the student's code
  result?: any; // the result from the execution of the testcase
  errors?: SourceError[]; // errors raised by interpreter during execution
}

export interface IMCQQuestion extends IQuestion {
  solution: number | null;
  answer: number | null;
  choices: MCQChoice[];
  type: 'mcq';
}

export interface IQuestion {
  answer: string | number | null;
  editorValue?: string | null;
  roomId: string | null;
  comments?: string;
  content: string;
  id: number;
  library: Library;
  graderLibrary?: Library; // For mission control
  type: QuestionType;
  grader?: {
    name: string;
    id: number;
  };
  gradedAt?: string;
  xp: number;
  grade: number;
  maxGrade: number;
  maxXp: number;
}

export type MCQChoice = {
  content: string;
  hint: string | null;
};

/* The two kinds of Questions available */
export enum QuestionTypes {
  programming = 'programming',
  mcq = 'mcq'
}
export type QuestionType = keyof typeof QuestionTypes;

/** Constants for external library names */
export enum ExternalLibraryNames {
  NONE = 'NONE',
  RUNES = 'RUNES',
  CURVES = 'CURVES',
  SOUNDS = 'SOUNDS',
  BINARYTREES = 'BINARYTREES',
  PIXNFLIX = 'PIX&FLIX',
  MACHINELEARNING = 'MACHINELEARNING',
  ALL = 'ALL'
}

export type ExternalLibraryName = (typeof ExternalLibraryNames)[keyof typeof ExternalLibraryNames];

type ExternalLibrary = {
  name: ExternalLibraryName;
  symbols: string[];
};

export type Library = {
  chapter: number;
  variant?: Variant;
  external: ExternalLibrary;
  globals: Array<{
    0: string;
    1: any;
    2?: string; // For mission control
  }>;
};

export type AutogradingResult = {
  resultType: string;
  expected?: string; // the correct answer for the testcase
  actual?: string; // the received answer from the student's code
  errors?: AutogradingError[];
};

export type AutogradingError = {
  errorType: string;
  line?: number;
  location?: string;
  errorLine?: string;
  errorExplanation?: string;
};
