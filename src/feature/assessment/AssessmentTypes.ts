import { SourceError, Variant } from 'js-slang/dist/types';

export const DEFAULT_QUESTION_ID: number = 0;
export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';

export enum AssessmentStatuses {
    attempting = 'attempting',
    attempted = 'attempted',
    not_attempted = 'not_attempted',
    submitted = 'submitted'
}
export type AssessmentStatus = keyof typeof AssessmentStatuses;

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
export interface IAssessmentOverview {
    category: AssessmentCategory;
    closeAt: string;
    coverImage: string;
    fileName?: string; // For mission control
    grade: number;
    gradingStatus: GradingStatus;
    id: number;
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
}

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
    title: string;
    questions: IQuestion[];
}

export interface IProgrammingQuestion extends IQuestion {
    answer: string | null;
    autogradingResults: AutogradingResult[];
    graderTemplate?: string;
    prepend: string;
    postpend: string;
    solutionTemplate: string;
    testcases: ITestcase[];
    testcasesPrivate?: ITestcase[]; // For mission control
    type: 'programming';
}

export interface ITestcase {
    answer: string; // the correct answer to the testcase
    errors?: SourceError[]; // errors raised by interpreter during execution
    program: string; // the program to be appended to the student's code
    result?: any; // the result from the execution of the testcase
    score: number;
    type: TestcaseType;
}

export interface IMCQQuestion extends IQuestion {
    answer: number | null;
    choices: MCQChoice[];
    solution: number | null;
    type: 'mcq';
}

export interface IQuestion {
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
}

export type MCQChoice = {
    content: string;
    hint: string | null;
};

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
