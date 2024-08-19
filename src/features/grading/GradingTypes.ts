import { ColDef } from 'ag-grid-community';

import {
  AssessmentStatus,
  AssessmentType,
  AutogradingResult,
  MCQChoice,
  ProgressStatus,
  Question,
  Testcase
} from '../../commons/assessment/AssessmentTypes';
import { Notification } from '../../commons/notificationBadge/NotificationBadgeTypes';

export enum ColumnFields {
  assessmentName = 'assessmentName',
  assessmentType = 'assessmentType',
  studentName = 'studentName',
  studentUsername = 'studentUsername',
  groupName = 'groupName',
  progressStatus = 'progressStatus',
  xp = 'xp',
  actionsIndex = 'actionsIndex'
}

export type ColumnFieldsKeys = keyof typeof ColumnFields;

export enum SortStates {
  ASC = 'sort-asc',
  DESC = 'sort-desc',
  NONE = 'sort'
}

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  assessmentId: number;
  assessmentNumber: string;
  assessmentName: string;
  assessmentType: AssessmentType;
  initialXp: number;
  xpBonus: number;
  xpAdjustment: number;
  currentXp: number;
  maxXp: number;
  isGradingPublished: boolean;
  progress: ProgressStatus;
  studentId: number;
  studentName: string | undefined;
  studentNames: string[] | undefined;
  studentUsername: string | undefined;
  studentUsernames: string[] | undefined;
  submissionStatus: AssessmentStatus;
  submissionId: number;
  groupName: string;
  groupLeaderId?: number;
  questionCount: number;
  gradedCount: number;
};

export type GradingOverviews = {
  count: number; // To support server-side pagination
  data: GradingOverview[];
};

export type GradingOverviewWithNotifications = {
  notifications: Notification[];
} & GradingOverview;

/**
 * The information fetched before
 * grading a submission.
 */
export type GradingAnswer = GradingQuestion[];

export type AllColsSortStates = {
  currentState: SortStateProperties;
  sortBy: ColumnFieldsKeys | '';
};

export type ColumnFiltersState = ColumnFilter[];

export type ColumnFilter = { id: string; value: unknown };

export type GradingColumnVisibility = ColumnFieldsKeys[];

export type GradingAssessment = {
  coverPicture: string;
  id: number;
  number: string;
  reading: string;
  story: string;
  summaryLong: string;
  summaryShort: string;
  title: string;
};

export type GradingQuery = {
  answers: GradingAnswer;
  assessment: GradingAssessment;
};

export type GradingSubmissionTableProps = {
  showAllSubmissions: boolean;
  totalRows: number;
  pageSize: number;
  submissions: GradingOverview[];
  updateEntries: (page: number, filterParams: object) => void;
};

export enum ColumnName {
  assessmentName = 'Name',
  assessmentType = 'Type',
  studentName = 'Student(s)',
  studentUsername = 'Username(s)',
  groupName = 'Group',
  progressStatus = 'Progress',
  xp = 'Raw XP (+Bonus)',
  actionsIndex = 'Actions'
}

export type ColumnNameKeys = keyof typeof ColumnName;

export type SortStateProperties = {
  assessmentName: SortStates;
  assessmentType: SortStates;
  studentName: SortStates;
  studentUsername: SortStates;
  groupName: SortStates;
  progressStatus: SortStates;
  xp: SortStates;
  actionsIndex: SortStates;
};

export type SortStatePropertiesTypes = keyof SortStateProperties;

export type IGradingTableRow = {
  assessmentName: string;
  assessmentType: string;
  studentName: string;
  studentUsername: string;
  groupName: string;
  progressStatus: ProgressStatus;
  xp: string;
  actionsIndex: number; // actions needs a column, but only submission ID data, so it stores submission ID
  courseID: number;
};

export type IGradingTableProperties = {
  customComponents: any;
  defaultColDefs: ColDef;
  headerHeight: number;
  overlayLoadingTemplate: string;
  overlayNoRowsTemplate: string;
  pageSize: number;
  pagination: boolean;
  rowClass: string;
  rowHeight: number;
  suppressMenuHide: boolean;
  suppressPaginationPanel: boolean;
  suppressRowClickSelection: boolean;
  tableMargins: string;
};

/**
 * Encapsulates information regarding grading a
 * particular question in a submission.
 */
export type GradingQuestion = {
  question: AnsweredQuestion;
  team?: Array<{
    username: any;
    name: string;
    id: number;
  }>;
  student: {
    name: string;
    username: string;
    id: number;
  };
  grade: {
    xp: number;
    xpAdjustment: number;
    comments?: string;
    grader?: {
      name: string;
      id: number;
    };
    gradedAt?: string;
  };
};

/**
 * A Question to be shown when a trainer is
 * grading a submission. This means that
 * either of (library & solutionTemplate) xor (choices) must
 * be present, and either of (solution) xor (answer) must be present.
 *
 * @property solution this can be either the answer to the MCQ, the solution to
 *   a programming question, or null.
 */
export type AnsweredQuestion = Question & Answer;

type Answer = {
  autogradingResults: AutogradingResult[];
  lastModifiedAt: string;
  prepend: string;
  postpend: string;
  testcases: Testcase[];
  solution: number | string | null;
  answer: string | number | null;
  maxXp: number;
  solutionTemplate?: string;
  choices?: MCQChoice[];
};
