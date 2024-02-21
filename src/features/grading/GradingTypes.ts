import {
  AssessmentType,
  AutogradingResult,
  GradingStatus,
  MCQChoice,
  Question,
  Testcase
} from '../../commons/assessment/AssessmentTypes';
import { Notification } from '../../commons/notificationBadge/NotificationBadgeTypes';

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
