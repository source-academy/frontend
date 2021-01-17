import { SourceError, Variant } from 'js-slang/dist/types';

import { ExternalLibrary, ExternalLibraryName } from '../application/types/ExternalTypes';

export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';

export enum AssessmentStatuses {
  attempting = 'attempting',
  attempted = 'attempted',
  not_attempted = 'not_attempted',
  submitted = 'submitted'
}
export type AssessmentStatus = keyof typeof AssessmentStatuses;

export type AssessmentWorkspaceParams = {
  assessmentId?: string;
  questionId?: string;
};

export enum GradingStatuses {
  excluded = 'excluded',
  graded = 'graded',
  grading = 'grading',
  none = 'none'
}
export type GradingStatus = keyof typeof GradingStatuses;

export enum AssessmentCategories {
  Contest = 'Contest',
  Mission = 'Mission',
  Path = 'Path',
  Sidequest = 'Sidequest',
  Practical = 'Practical'
}
export type AssessmentCategory = keyof typeof AssessmentCategories;

export enum TestcaseTypes {
  // These are rendered in full by the Mission Autograder
  public = 'public',
  // These are rendered with a placeholder by the Autograder
  hidden = 'hidden',
  // These should only exist in the grading workspace for submissions
  private = 'private'
}
export type TestcaseType = keyof typeof TestcaseTypes;

export enum QuestionTypes {
  programming = 'programming',
  mcq = 'mcq'
}
export type QuestionType = keyof typeof QuestionTypes;

/*
W* Used to display information regarding an assessment in the UI.
*
 * @property closeAt an ISO 8601 compliant date string specifiying when
 *   the assessment closes
 * @property openAt an ISO 8601 compliant date string specifiying when
 *   the assessment opens
 */
export type AssessmentOverview = {
  category: AssessmentCategory;
  closeAt: string;
  coverImage: string;
  fileName?: string; // For mission control
  grade: number;
  gradingStatus: GradingStatus;
  id: number;
  isPublished?: boolean;
  maxGrade: number;
  maxXp: number;
  number?: string; // For mission control
  openAt: string;
  private?: boolean;
  reading?: string; // For mission control
  shortSummary: string;
  status: AssessmentStatus;
  story: string | null;
  title: string;
  xp: number;
};

/*
 * Used when an assessment is being actively attempted/graded.
 */
export type Assessment = {
  category: AssessmentCategory;
  globalDeployment?: Library; // For mission control
  graderDeployment?: Library; // For mission control
  id: number;
  longSummary: string;
  missionPDF: string;
  title: string;
  questions: Question[];
};

export interface IProgrammingQuestion extends BaseQuestion {
  answer: string | null;
  autogradingResults: AutogradingResult[];
  graderTemplate?: string;
  prepend: string;
  postpend: string;
  solutionTemplate: string;
  testcases: Testcase[];
  testcasesPrivate?: Testcase[]; // For mission control
  type: 'programming';
}

export interface IMCQQuestion extends BaseQuestion {
  answer: number | null;
  choices: MCQChoice[];
  solution: number | null;
  type: 'mcq';
}

export type BaseQuestion = {
  answer: string | number | null;
  comments?: string;
  content: string;
  editorValue?: string | null;
  grade: number;
  gradedAt?: string;
  grader?: {
    name: string;
    id: number;
  };
  graderLibrary?: Library; // For mission control
  id: number;
  library: Library;
  maxGrade: number;
  maxXp: number;
  roomId: string | null;
  type: QuestionType;
  xp: number;
};

export type Question = IProgrammingQuestion | IMCQQuestion;

export type Library = {
  chapter: number;
  variant?: Variant;
  external: ExternalLibrary;
  globals: Array<{
    0: string;
    1: any;
    2?: string; // For mission control
  }>;
  moduleParams?: any;
};

export type Testcase = {
  answer: string; // the correct answer to the testcase
  errors?: SourceError[]; // errors raised by interpreter during execution
  program: string; // the program to be appended to the student's code
  result?: any; // the result from the execution of the testcase
  score: number;
  type: TestcaseType;
};

export type ContestEntry = {
  studentUsername: string;
  program: string; //contest entry program to be input into editor  
}

export type ContestVotingSubmission = {
  [key: string]: number
}

export type MCQChoice = {
  content: string;
  hint: string | null;
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
  errorMessage?: string;
};

export const emptyLibrary = (): Library => {
  return {
    chapter: -1,
    external: {
      name: 'NONE' as ExternalLibraryName,
      symbols: []
    },
    globals: []
  };
};

export const normalLibrary = (): Library => {
  return {
    chapter: 1,
    external: {
      name: 'NONE' as ExternalLibraryName,
      symbols: []
    },
    globals: []
  };
};

export const overviewTemplate = (): AssessmentOverview => {
  return {
    category: AssessmentCategories.Mission,
    closeAt: '2100-12-01T00:00+08',
    coverImage: 'https://fakeimg.pl/300/',
    grade: 1,
    id: -1,
    maxGrade: 0,
    maxXp: 0,
    openAt: '2000-01-01T00:00+08',
    title: 'Insert title here',
    reading: '',
    shortSummary: 'Insert short summary here',
    status: AssessmentStatuses.not_attempted,
    story: 'mission',
    xp: 0,
    gradingStatus: 'none'
  };
};

export const programmingTemplate = (): IProgrammingQuestion => {
  return {
    autogradingResults: [],
    answer: '// [Marking Scheme]\n// 1 mark for correct answer',
    roomId: '19422043',
    content: 'Enter content here',
    id: 0,
    library: emptyLibrary(),
    graderLibrary: emptyLibrary(),
    prepend: '',
    solutionTemplate: '//This is a mock solution template',
    postpend: '',
    testcases: [],
    testcasesPrivate: [],
    type: 'programming',
    xp: 0,
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  };
};

export const testcaseTemplate = (): Testcase => {
  return {
    type: TestcaseTypes.public,
    answer: '',
    score: 0,
    program: ''
  };
};

export const mcqTemplate = (): IMCQQuestion => {
  return {
    answer: 3,
    roomId: null,
    content: 'This is a mock MCQ question',
    choices: [
      {
        content: 'A',
        hint: null
      },
      {
        content: 'B',
        hint: null
      },
      {
        content: 'C',
        hint: null
      },
      {
        content: 'D',
        hint: null
      }
    ],
    id: 2,
    library: emptyLibrary(),
    graderLibrary: emptyLibrary(),
    type: 'mcq',
    solution: 0,
    xp: 0,
    grade: 0,
    maxGrade: 0,
    maxXp: 0
  };
};

export const assessmentTemplate = (): Assessment => {
  return {
    category: 'Mission',
    globalDeployment: normalLibrary(),
    graderDeployment: emptyLibrary(),
    id: -1,
    longSummary: 'Insert mission briefing here',
    missionPDF: 'www.google.com',
    questions: [programmingTemplate()],
    title: 'Insert title here'
  };
};
