import { ColDef } from 'ag-grid-community';

import {
  AssessmentType,
  AutogradingResult,
  GradingStatus,
  MCQChoice,
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
  submissionStatus = 'submissionStatus',
  gradingStatus = 'gradingStatus',
  xp = 'xp',
  actionsIndex = 'actionsIndex'
}

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
  studentId: number;
  studentName: string;
  studentUsername: string;
  submissionId: number;
  submissionStatus: string;
  groupName: string;
  groupLeaderId?: number;
  gradingStatus: GradingStatus;
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
  sortBy: string;
};

export type ColumnFiltersState = ColumnFilter[];

export type ColumnFilter = {
  id: string;
  value: unknown;
};

export type GradingColumnVisibility = string[];

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
  totalRows: number;
  pageSize: number;
  submissions: GradingOverview[];
  updateEntries: (page: number, filterParams: Object) => void;
};

export enum ColumnName {
  assessmentName = 'Name',
  assessmentType = 'Type',
  studentName = 'Student',
  studentUsername = 'Username',
  groupName = 'Group',
  submissionStatus = 'Progress',
  gradingStatus = 'Grading',
  xp = 'Raw XP (+Bonus)',
  actionsIndex = 'Actions'
}

export type SortStateProperties = {
  assessmentName: SortStates;
  assessmentType: SortStates;
  studentName: SortStates;
  studentUsername: SortStates;
  groupName: SortStates;
  submissionStatus: SortStates;
  gradingStatus: SortStates;
  xp: SortStates;
  actionsIndex: SortStates;
};

export type IGradingTableRow = {
  assessmentName: string;
  assessmentType: string;
  studentName: string;
  studentUsername: string;
  groupName: string;
  submissionStatus: string;
  gradingStatus: string;
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
  tableHeight: string;
  tableMargins: string;
};

/**
 * Encapsulates information regarding grading a
 * particular question in a submission.
 */
export type GradingQuestion = {
  question: AnsweredQuestion;
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
  prepend: string;
  postpend: string;
  testcases: Testcase[];
  solution: number | string | null;
  answer: string | number | null;
  maxXp: number;
  solutionTemplate?: string;
  choices?: MCQChoice[];
};
