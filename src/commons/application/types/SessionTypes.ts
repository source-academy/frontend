import { Octokit } from '@octokit/rest';
import { Chapter, Variant } from 'js-slang/dist/types';

import { GradingOverviews, GradingQuery } from '../../../features/grading/GradingTypes';
import { Device, DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import { TeamFormationOverview } from '../../../features/teamFormation/TeamFormationTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview
} from '../../assessment/AssessmentTypes';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { GameState, Role, Story } from '../ApplicationTypes';

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
  readonly story: Story;

  // Course Configuration
  readonly courseName?: string;
  readonly courseShortName?: string;
  readonly viewable?: boolean;
  readonly enableGame?: boolean;
  readonly enableAchievements?: boolean;
  readonly enableSourcecast?: boolean;
  readonly enableStories?: boolean;
  readonly sourceChapter?: Chapter;
  readonly sourceVariant?: Variant;
  readonly moduleHelpText?: string;
  readonly assetsPrefix?: string;

  readonly assessmentConfigurations?: AssessmentConfiguration[];
  readonly userCourseRegistrations?: AdminPanelCourseRegistration[];

  // For research data collection
  readonly agreedToResearch?: boolean | null;
  readonly sessionId: number;

  readonly assessmentOverviews?: AssessmentOverview[];
  readonly assessments: { [id: number]: Assessment };
  readonly gradingOverviews?: GradingOverviews;
  readonly students?: User[];
  readonly teamFormationOverview?: TeamFormationOverview;
  readonly teamFormationOverviews?: TeamFormationOverview[];
  readonly gradings: { [id: number]: GradingQuery };
  readonly notifications: Notification[];
  readonly googleUser?: string;
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
  username: string;
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
