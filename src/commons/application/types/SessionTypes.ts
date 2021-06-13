import { Octokit } from '@octokit/rest';

import { MissionRepoData } from '../../../commons/githubAssessments/GitHubMissionTypes';
import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Device, DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import { Assessment, AssessmentOverview, AssessmentType } from '../../assessment/AssessmentTypes';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { HistoryHelper } from '../../utils/HistoryHelper';
import { GameState, Role, Story } from '../ApplicationTypes';

export const FETCH_AUTH = 'FETCH_AUTH';
export const FETCH_ASSESSMENT = 'FETCH_ASSESSMENT';
export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS';
export const FETCH_GRADING = 'FETCH_GRADING';
export const FETCH_GRADING_OVERVIEWS = 'FETCH_GRADING_OVERVIEWS';
export const LOGIN = 'LOGIN';
export const LOGOUT_GOOGLE = 'LOGOUT_GOOGLE';
export const LOGIN_GITHUB = 'LOGIN_GITHUB';
export const LOGOUT_GITHUB = 'LOGOUT_GITHUB';
export const SET_TOKENS = 'SET_TOKENS';
export const SET_USER = 'SET_USER';
export const SET_COURSE_CONFIGURATION = 'SET_COURSE_CONFIGURATION';
export const SET_COURSE_REGISTRATION = 'SET_COURSE_REGISTRATION';
export const SET_GOOGLE_USER = 'SET_GOOGLE_USER';
export const SET_GITHUB_ASSESSMENT = 'SET_GITHUB_ASSESSMENT';
export const SET_GITHUB_OCTOKIT_OBJECT = 'SET_GITHUB_OCTOKIT_OBJECT';
export const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';
export const SUBMIT_GRADING = 'SUBMIT_GRADING';
export const SUBMIT_GRADING_AND_CONTINUE = 'SUBMIT_GRADING_AND_CONTINUE';
export const REAUTOGRADE_SUBMISSION = 'REAUTOGRADE_SUBMISSION';
export const REAUTOGRADE_ANSWER = 'REAUTOGRADE_ANSWER';
export const REMOVE_GITHUB_OCTOKIT_OBJECT = 'REMOVE_GITHUB_OCTOKIT_OBJECT';
export const UNSUBMIT_SUBMISSION = 'UNSUBMIT_SUBMISSION';
export const UPDATE_HISTORY_HELPERS = 'UPDATE_HISTORY_HELPERS';
export const UPDATE_ASSESSMENT_OVERVIEWS = 'UPDATE_ASSESSMENT_OVERVIEWS';
export const UPDATE_ASSESSMENT = 'UPDATE_ASSESSMENT';
export const UPDATE_GRADING_OVERVIEWS = 'UPDATE_GRADING_OVERVIEWS';
export const UPDATE_GRADING = 'UPDATE_GRADING';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const ACKNOWLEDGE_NOTIFICATIONS = 'ACKNOWLEDGE_NOTIFICATIONS';
export const UPDATE_NOTIFICATIONS = 'UPDATE_NOTIFICATIONS';

export const UPLOAD_KEYSTROKE_LOGS = 'UPLOAD_KEYSTROKE_LOGS';
export const UPLOAD_UNSENT_LOGS = 'UPLOAD_UNSENT_LOGS';

export type SessionState = {
  readonly tokens: Tokens;
  readonly user: User;
  readonly courseRegistration: CourseRegistration;
  readonly courseConfiguration: CourseConfiguration;
  readonly assessmentOverviews?: AssessmentOverview[];
  readonly assessments: Map<number, Assessment>;
  readonly gradingOverviews?: GradingOverview[];
  readonly gradings: Map<number, Grading>;
  readonly historyHelper: HistoryHelper;
  readonly notifications: Notification[];
  readonly googleUser?: string;
  readonly githubAssessment?: MissionRepoData;
  readonly githubOctokitObject: { octokit: Octokit | undefined };
  readonly remoteExecutionDevices?: Device[];
  readonly remoteExecutionSession?: DeviceSession;
};

export type Tokens = {
  accessToken?: string;
  refreshToken?: string;
};

export type User = {
  userId?: number;
  name?: string;
  courses: number[];
};

export type CourseRegistration = {
  role?: Role;
  group: string | null;
  gameState?: GameState;
  courseId?: number;
  grade: number;
  maxGrade: number;
  xp: number;
  story: Story;
};

export type CourseConfiguration = {
  name?: string;
  moduleCode?: string;
  viewable?: boolean;
  enableGame?: boolean;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  sourceChapter: number;
  sourceVariant: string;
  moduleHelpText?: string;
  assessmentTypes: AssessmentType[];
};
