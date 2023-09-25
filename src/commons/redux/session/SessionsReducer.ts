import { Octokit } from '@octokit/rest';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Variant } from 'js-slang/dist/types';
import { GameState, Role, Story } from 'src/commons/application/ApplicationTypes';
import {
  AdminPanelCourseRegistration,
  CourseRegistration,
  NotificationConfiguration,
  Tokens,
  UpdateCourseConfiguration,
  User
} from 'src/commons/application/types/SessionTypes';
import { UserCourse } from 'src/commons/application/types/SessionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview
} from 'src/commons/assessment/AssessmentTypes';
import { MissionRepoData } from 'src/commons/githubAssessments/GitHubMissionTypes';
import { Notification } from 'src/commons/notificationBadge/NotificationBadgeTypes';
import { generateOctokitInstance } from 'src/commons/utils/GitHubPersistenceHelper';
import { Grading, GradingOverview } from 'src/features/grading/GradingTypes';
import { Device, DeviceSession } from 'src/features/remoteExecution/RemoteExecutionTypes';

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

export const defaultSession: SessionState = {
  courses: [],
  group: null,
  gameState: {
    completed_quests: [],
    collectibles: {}
  },
  xp: 0,
  allUserXp: undefined,
  story: {
    story: '',
    playStory: false
  },
  assessments: new Map<number, Assessment>(),
  assessmentOverviews: undefined,
  agreedToResearch: undefined,
  sessionId: Date.now(),
  githubOctokitObject: { octokit: undefined },
  gradingOverviews: undefined,
  gradings: new Map<number, Grading>(),
  notifications: []
};

export const { actions: sessionReducerActions, reducer: sessionsReducer } = createSlice({
  name: 'session',
  initialState: defaultSession,
  reducers: {
    remoteExecUpdateDevices(state, { payload }: PayloadAction<Device[]>) {
      state.remoteExecutionDevices = payload;
    },
    remoteExecUpdateSession(state, { payload }: PayloadAction<DeviceSession>) {
      state.remoteExecutionSession = payload;
    },
    removeGitHubOctokitObjectAndAccessToken(state) {
      state.githubOctokitObject.octokit = undefined;
      state.githubAccessToken = undefined;
    },
    setAdminPanelCourseRegistrations(
      state,
      { payload }: PayloadAction<AdminPanelCourseRegistration[]>
    ) {
      state.userCourseRegistrations = payload;
    },
    setAssessmentConfigurations(state, { payload }: PayloadAction<AssessmentConfiguration[]>) {
      state.assessmentConfigurations = payload;
    },
    setConfigurableNotificationConfigs(
      state,
      { payload }: PayloadAction<NotificationConfiguration[]>
    ) {
      state.configurableNotificationConfigs = payload;
    },
    setCourseConfiguration(state, { payload }: PayloadAction<UpdateCourseConfiguration>) {
      return {
        ...state,
        ...payload
      };
    },
    setCourseRegistration(state, { payload }: PayloadAction<Partial<CourseRegistration>>) {
      return {
        ...state,
        ...payload
      };
    },
    setGithubAccessToken(state, { payload }: PayloadAction<string | undefined>) {
      state.githubAccessToken = payload;
    },
    setGithubAssessment(state, { payload }: PayloadAction<MissionRepoData>) {
      state.githubAssessment = payload;
    },
    setGithubOctokitObject: {
      prepare: (authToken?: string) => ({ payload: generateOctokitInstance(authToken ?? '') }),
      reducer(state, { payload }: PayloadAction<ReturnType<typeof generateOctokitInstance>>) {
        state.githubOctokitObject.octokit = payload;
      }
    },
    setGoogleUser(state, { payload }: PayloadAction<string | undefined>) {
      state.googleUser = payload;
    },
    setNotificationConfigs(state, { payload }: PayloadAction<NotificationConfiguration[]>) {
      state.notificationConfigs = payload;
    },
    setTokens(state, { payload }: PayloadAction<Tokens>) {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },
    setUser(state, { payload }: PayloadAction<User>) {
      return {
        ...state,
        ...payload
      };
    },
    updateAllUserXp(state, { payload }: PayloadAction<string[][]>) {
      state.allUserXp = payload;
    },
    updateAssessment(state, { payload }: PayloadAction<Assessment>) {
      state.assessments.set(payload.id, payload);
    },
    updateAssessmentOverviews(state, { payload }: PayloadAction<AssessmentOverview[]>) {
      state.assessmentOverviews = payload;
    },
    updateGrading: {
      prepare: (submissionId: number, grading: Grading) => ({ payload: { submissionId, grading } }),
      reducer(state, { payload }: PayloadAction<{ grading: Grading; submissionId: number }>) {
        state.gradings.set(payload.submissionId, payload.grading);
      }
    },
    updateGradingOverviews(state, { payload }: PayloadAction<GradingOverview[]>) {
      state.gradingOverviews = payload;
    },
    updateNotifications(state, { payload }: PayloadAction<Notification[]>) {
      state.notifications = payload;
    },
    updateTotalXp(state, { payload }: PayloadAction<number>) {
      state.xp = payload;
    }
  }
});
