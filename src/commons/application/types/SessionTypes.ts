import { Octokit } from '@octokit/rest';
import { Variant } from 'js-slang/dist/types';

import { MissionRepoData } from '../../../commons/githubAssessments/GitHubMissionTypes';
import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Device, DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview
} from '../../assessment/AssessmentTypes';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { HistoryHelper } from '../../utils/HistoryHelper';
import { GameState, Role, Story } from '../ApplicationTypes';

export const FETCH_AUTH = 'FETCH_AUTH';
export const FETCH_USER_AND_COURSE = 'FETCH_USER_AND_COURSE';
export const FETCH_COURSE_CONFIG = 'FETCH_COURSE_CONFIG';
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
export const SET_ASSESSMENT_CONFIGURATIONS = 'SET_ASSESSMENT_CONFIGURATIONS';
export const SET_ADMIN_PANEL_COURSE_REGISTRATIONS = 'SET_ADMIN_PANEL_COURSE_REGISTRATIONS';
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
export const UPDATE_LATEST_VIEWED_COURSE = 'UPDATE_LATEST_VIEWED_COURSE';
export const UPDATE_COURSE_CONFIG = 'UPDATE_COURSE_CONFIG';
export const FETCH_ASSESSMENT_CONFIGS = 'FETCH_ASSESSMENT_CONFIGS';
export const UPDATE_ASSESSMENT_CONFIGS = 'UPDATE_ASSESSMENT_CONFIGS';
export const DELETE_ASSESSMENT_CONFIG = 'DELETE_ASSESSMENT_CONFIG';
export const FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS = 'FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS';
export const UPDATE_USER_ROLE = 'UPDATE_USER_ROLE';
export const DELETE_USER_COURSE_REGISTRATION = 'DELETE_USER_COURSE_REGISTRATION';

export const UPLOAD_KEYSTROKE_LOGS = 'UPLOAD_KEYSTROKE_LOGS';
export const UPLOAD_UNSENT_LOGS = 'UPLOAD_UNSENT_LOGS';

export type SessionState = {
  // Tokens
  readonly accessToken?: string;
  readonly refreshToken?: string;

  // User
  readonly userId?: number;
  readonly name?: string;
  readonly courses: UserCourse[];

  // Course Registration
  readonly courseRegId?: number;
  readonly role?: Role;
  readonly group: string | null;
  readonly gameState: GameState;
  readonly courseId?: number;
  readonly grade: number;
  readonly maxGrade: number;
  readonly xp: number;
  readonly story: Story;

  // Course Configuration
  readonly courseName?: string;
  readonly courseShortName?: string;
  readonly viewable?: boolean;
  readonly enableGame?: boolean;
  readonly enableAchievements?: boolean;
  readonly enableSourcecast?: boolean;
  readonly sourceChapter: number;
  readonly sourceVariant: Variant;
  readonly moduleHelpText?: string;

  readonly assessmentConfigurations?: AssessmentConfiguration[];
  readonly userCourseRegistrations?: AdminPanelCourseRegistration[];

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
  accessToken: string;
  refreshToken: string;
};

export type UserCourse = {
  courseId: number;
  courseName: string;
  courseShortName: string;
  role: Role;
  viewable: boolean;
};

export type User = {
  userId: number;
  name: string;
  courses: UserCourse[];
};

export type CourseRegistration = {
  courseRegId: number;
  role: Role;
  group: string | null;
  gameState?: GameState;
  courseId: number;
  grade: number;
  maxGrade: number;
  xp: number;
  story?: Story;
};

export type CourseConfiguration = {
  courseName: string;
  courseShortName: string;
  viewable: boolean;
  enableGame: boolean;
  enableAchievements: boolean;
  enableSourcecast: boolean;
  sourceChapter: number;
  sourceVariant: Variant;
  moduleHelpText: string;
};

export type AdminPanelCourseRegistration = {
  courseRegId: number;
  courseId: number;
  name?: string;
  username: string;
  role: Role;
  group?: string;
};

export type UpdateCourseConfiguration = Partial<CourseConfiguration>;
