import { Octokit } from '@octokit/rest';
import { Chapter, Variant } from 'js-slang/dist/types';

import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Device, DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview
} from '../../assessment/AssessmentTypes';
import { MissionRepoData } from '../../githubAssessments/GitHubMissionTypes';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { GameState, Role, Story } from '../ApplicationTypes';

export const FETCH_AUTH = 'FETCH_AUTH';
export const FETCH_USER_AND_COURSE = 'FETCH_USER_AND_COURSE';
export const FETCH_COURSE_CONFIG = 'FETCH_COURSE_CONFIG';
export const FETCH_ASSESSMENT = 'FETCH_ASSESSMENT';
export const FETCH_ASSESSMENT_ADMIN = 'FETCH_ASSESSMENT_ADMIN';
export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS';
export const FETCH_ALL_USER_XP = 'FETCH_ALL_USER_XP';
export const FETCH_TOTAL_XP = 'FETCH_TOTAL_XP';
export const FETCH_TOTAL_XP_ADMIN = 'FETCH_TOTAL_XP_ADMIN';
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
export const SET_GITHUB_ACCESS_TOKEN = 'SET_GITHUB_ACCESS_TOKEN';
export const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';
export const SUBMIT_GRADING = 'SUBMIT_GRADING';
export const SUBMIT_GRADING_AND_CONTINUE = 'SUBMIT_GRADING_AND_CONTINUE';
export const REAUTOGRADE_SUBMISSION = 'REAUTOGRADE_SUBMISSION';
export const REAUTOGRADE_ANSWER = 'REAUTOGRADE_ANSWER';
export const REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN =
  'REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN';
export const UNSUBMIT_SUBMISSION = 'UNSUBMIT_SUBMISSION';
export const UPDATE_ASSESSMENT_OVERVIEWS = 'UPDATE_ASSESSMENT_OVERVIEWS';
export const UPDATE_TOTAL_XP = 'UPDATE_TOTAL_XP';
export const UPDATE_ALL_USER_XP = 'UPDATE_ALL_USER_XP';
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
export const UPDATE_COURSE_RESEARCH_AGREEMENT = 'UPDATE_COURSE_RESEARCH_AGREEMENT';
export const DELETE_USER_COURSE_REGISTRATION = 'DELETE_USER_COURSE_REGISTRATION';
export const FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS = 'FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS';
export const FETCH_NOTIFICATION_CONFIGS = 'FETCH_NOTIFICATION_CONFIGS';
export const SET_NOTIFICATION_CONFIGS = 'SET_NOTIFICATION_CONFIGS';
export const SET_CONFIGURABLE_NOTIFICATION_CONFIGS = 'SET_CONFIGURABLE_NOTIFICATION_CONFIG';
export const UPDATE_NOTIFICATION_CONFIG = 'UPDATE_NOTIFICATION_CONFIG';
export const UPDATE_NOTIFICATION_PREFERENCES = 'UPDATE_NOTIFICATION_PREFERENCES';
export const DELETE_TIME_OPTIONS = 'DELETE_TIME_OPTIONS';
export const UPDATE_TIME_OPTIONS = 'UPDATE_TIME_OPTIONS';

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
  readonly xp: number;
  readonly allUserXp: string[][] | undefined;
  readonly story: Story;

  // Course Configuration
  readonly courseName?: string;
  readonly courseShortName?: string;
  readonly viewable?: boolean;
  readonly enableGame?: boolean;
  readonly enableAchievements?: boolean;
  readonly enableSourcecast?: boolean;
  readonly enableStories?: boolean;
  readonly sourceChapter?: number;
  readonly sourceVariant?: Variant;
  readonly moduleHelpText?: string;
  readonly assetsPrefix?: string;

  readonly assessmentConfigurations?: AssessmentConfiguration[];
  readonly userCourseRegistrations?: AdminPanelCourseRegistration[];

  readonly notificationConfigs?: NotificationConfiguration[];
  readonly configurableNotificationConfigs?: NotificationConfiguration[];

  // For research data collection
  readonly agreedToResearch?: boolean | null;
  readonly sessionId: number;

  readonly assessmentOverviews?: AssessmentOverview[];
  readonly assessments: Map<number, Assessment>;
  readonly gradingOverviews?: GradingOverview[];
  readonly gradings: Map<number, Grading>;
  readonly notifications: Notification[];
  readonly googleUser?: string;
  readonly githubAssessment?: MissionRepoData;
  readonly githubOctokitObject: { octokit: Octokit | undefined };
  readonly githubAccessToken?: string;
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
  xp: number;
  story?: Story;
  agreedToResearch: boolean | null;
};

export type CourseConfiguration = {
  courseName: string;
  courseShortName: string;
  viewable: boolean;
  enableGame: boolean;
  enableAchievements: boolean;
  enableSourcecast: boolean;
  enableStories: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  moduleHelpText: string;
  assetsPrefix: string;
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

export type TimeOption = {
  id: number;
  isDefault: boolean;
  minutes: number;
  notificationConfigId?: number;
};

export type NotificationPreference = {
  id: number;
  isEnabled: boolean | null;
  timeOptionId: number | null;
  notificationConfigId?: number;
};

export type NotificationConfiguration = {
  id: number;
  isEnabled: boolean;
  notificationType: {
    id: number;
    name: string;
    isEnabled: boolean;
    forStaff: boolean;
  };
  timeOptions: TimeOption[];
  assessmentConfig: {
    id: number;
    type: string;
  } | null;
  notificationPreference: NotificationPreference;
  course: any;
};
