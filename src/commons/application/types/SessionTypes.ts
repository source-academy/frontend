import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Device, DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import { Assessment, AssessmentOverview } from '../../assessment/AssessmentTypes';
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
export const SET_TOKENS = 'SET_TOKENS';
export const SET_USER = 'SET_USER';
export const SET_GOOGLE_USER = 'SET_GOOGLE_USER';
export const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';
export const SUBMIT_GRADING = 'SUBMIT_GRADING';
export const SUBMIT_GRADING_AND_CONTINUE = 'SUBMIT_GRADING_AND_CONTINUE';
export const REAUTOGRADE_SUBMISSION = 'REAUTOGRADE_SUBMISSION';
export const REAUTOGRADE_ANSWER = 'REAUTOGRADE_ANSWER';
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
  readonly accessToken?: string;
  readonly assessmentOverviews?: AssessmentOverview[];
  readonly assessments: Map<number, Assessment>;
  readonly grade: number;
  readonly gradingOverviews?: GradingOverview[];
  readonly gradings: Map<number, Grading>;
  readonly group: string | null;
  readonly historyHelper: HistoryHelper;
  readonly maxGrade: number;
  readonly maxXp: number;
  readonly refreshToken?: string;
  readonly role?: Role;
  readonly story: Story;
  readonly gameState: GameState;
  readonly name?: string;
  readonly userId?: number;
  readonly xp: number;
  readonly notifications: Notification[];
  readonly googleUser?: string;
  readonly remoteExecutionDevices?: Device[];
  readonly remoteExecutionSession?: DeviceSession;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  userId: number;
  name: string;
  role: Role;
  group: string | null;
  grade: number;
  story?: Story;
  gameState?: GameState;
};
