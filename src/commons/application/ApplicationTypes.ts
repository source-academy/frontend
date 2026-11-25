import type { AchievementState } from '../../features/achievement/AchievementTypes';
import type { DashboardState } from '../../features/dashboard/DashboardTypes';
import type { LanguageDirectoryState } from '../../features/directory/LanguageDirectoryTypes';
import type { PluginDirectoryState } from '../../features/directory/PluginDirectoryTypes';
import type { LeaderboardState } from '../../features/leaderboard/LeaderboardTypes';
import type { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { freshSortState } from '../../pages/academy/grading/subcomponents/GradingSubmissionsTable';
import { WORKSPACE_BASE_PATHS } from '../../pages/fileSystem/createInBrowserFileSystem';
import { type InterpreterError } from '../errors/InterpreterError';
import { defaultFeatureFlags, type FeatureFlagsState } from '../featureFlags';
import type { FileSystemState } from '../fileSystem/FileSystemTypes';
import type { SideContentManagerState, SideContentState } from '../sideContent/SideContentTypes';
import type {
  WorkspaceLocation,
  WorkspaceManagerState,
  WorkspaceState,
} from '../workspace/WorkspaceTypes';
import type { RouterState } from './types/CommonsTypes';
import { ExternalLibraryName } from './types/ExternalTypes';
import type { SessionState } from './types/SessionTypes';
import type { VscodeState } from './types/VscodeTypes';

export type OverallState = {
  readonly router: RouterState;
  readonly achievement: AchievementState;
  readonly leaderboard: LeaderboardState;
  readonly playground: PlaygroundState;
  readonly session: SessionState;
  readonly workspaces: WorkspaceManagerState;
  readonly dashboard: DashboardState;
  readonly featureFlags: FeatureFlagsState;
  readonly fileSystem: FileSystemState;
  readonly sideContent: SideContentManagerState;
  readonly vscode: VscodeState;
  readonly languageDirectory: LanguageDirectoryState;
  readonly pluginDirectory: PluginDirectoryState;
};

export type Story = {
  story: string;
  playStory: boolean;
};

export type GameState = {
  collectibles: { [id: string]: string };
  completed_quests: string[];
};

/**
 * An output while the program is still being run in the interpreter. As a
 * result, there are no return values or SourceErrors yet. However, there could
 * have been calls to display (console.log) that need to be printed out.
 */
export type RunningOutput = {
  type: 'running';
  consoleLogs: string[];
};

/**
 * An output which reflects the program which the user had entered. Not a true
 * Output from the interpreter, but simply there to let he user know what had
 * been entered.
 */
export type CodeOutput = {
  type: 'code';
  value: string;
};

/**
 * An output which represents a program being run successfully, i.e. with a
 * return value at the end. A program can have either a return value, or errors,
 * but not both.
 */
export type ResultOutput = {
  type: 'result';
  value: unknown;
  consoleLogs: string[];
  runtime?: number;
  isProgram?: boolean;
};

/**
 * An output which represents a program being run unsuccessfully, i.e. with
 * errors at the end. A program can have either a return value, or errors, but
 * not both.
 */
export type ErrorOutput = {
  type: 'errors';
  errors: InterpreterError[];
  consoleLogs: string[];
};

/**
 * An output which represents a message being displayed to the user. Not a true
 * result from the program, but rather a customised notification meant to highlight
 * events that occur outside execution of the program.
 */
export type NotificationOutput = {
  type: 'notification';
  consoleLog: string;
};

export type InterpreterOutput =
  | RunningOutput
  | CodeOutput
  | ResultOutput
  | ErrorOutput
  | NotificationOutput;

export enum Role {
  Student = 'student',
  Staff = 'staff',
  Admin = 'admin',
}

export const defaultRouter: RouterState = null;

export const defaultDashboard: DashboardState = {
  gradingSummary: {
    cols: [],
    rows: [],
  },
};

export const defaultAchievement: AchievementState = {
  achievements: [],
  goals: [],
  users: [],
  assessmentOverviews: [],
};

export const defaultLeaderboard: LeaderboardState = {
  paginatedUserXp: { rows: [], userCount: 0 },
  contestScore: [],
  contestPopularVote: [],
  code: '',
  contests: [],
  initialRun: {},
};

export const defaultPlayground: PlaygroundState = {
  githubSaveInfo: { repoName: '', filePath: '' },
};

export const defaultEditorValue = '// Type your program in here!';

/**
 * Create a default IWorkspaceState for 'resetting' a workspace.
 * Takes in parameters to set the js-slang library and chapter.
 *
 * @param workspaceLocation the location of the workspace, used for context
 */
export const createDefaultWorkspace = (workspaceLocation: WorkspaceLocation): WorkspaceState => ({
  autogradingResults: [],
  isFolderModeEnabled: false,
  activeEditorTabIndex: 0,
  editorTabs: [
    {
      filePath: ['playground', 'sicp'].includes(workspaceLocation)
        ? getDefaultFilePath(workspaceLocation)
        : undefined,
      value: ['playground'].includes(workspaceLocation) ? defaultEditorValue : '',
      highlightedLines: [],
      breakpoints: [],
    },
  ],
  programPrependValue: '',
  programPostpendValue: '',
  editorSessionId: '',
  sessionDetails: null,
  isEditorReadonly: false,
  editorTestcases: [],
  externalLibrary: ExternalLibraryName.NONE,
  execTime: 1000,
  output: [],
  replHistory: {
    browseIndex: null,
    records: [],
    originalValue: '',
  },
  replValue: '',
  hasTokenCounter: false,
  tokenCount: 0,
  customNotification: '',
  sharedbConnected: false,
  stepLimit: 1000,
  isRunning: false,
  isWaitingForInput: false,
  enableDebugging: true,
  cseSnapshots: null,
  files: {},
  updateUserRoleCallback: () => {},
  versionHistory: {
    versions: [],
    selectedVersion: null,
    selectedVersionCode: null,
    isLoadingCode: false,
    isLoading: false,
    isHistoryPanelOpen: false,
    isAutoSaving: false,
  },
  saveStatus: 'idle',
});

const defaultFileName = 'program.js';
export const getDefaultFilePath = (workspaceLocation: WorkspaceLocation) =>
  `${WORKSPACE_BASE_PATHS[workspaceLocation]}/${defaultFileName}`;

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: {
    ...createDefaultWorkspace('assessment'),
    currentAssessment: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false,
  },
  grading: {
    ...createDefaultWorkspace('grading'),
    submissionsTableFilters: {
      columnFilters: [],
    },
    currentSubmission: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false,
    // TODO: The below should be a separate state
    // instead of using the grading workspace state
    requestCounter: 0,
    allColsSortStates: {
      currentState: freshSortState,
      sortBy: '',
    },
    hasLoadedBefore: false,
  },
  playground: {
    ...createDefaultWorkspace('playground'),
    usingUpload: false,
    currentStep: -1,
    stepsTotal: 0,
    breakpointSteps: [],
    changepointSteps: [],
    activeEditorTabIndex: 0,
    editorTabs: [
      {
        filePath: getDefaultFilePath('playground'),
        value: defaultEditorValue,
        highlightedLines: [],
        breakpoints: [],
      },
    ],
  },
  sicp: {
    ...createDefaultWorkspace('sicp'),
    usingUpload: false,
    currentStep: -1,
    stepsTotal: 0,
    breakpointSteps: [],
    changepointSteps: [],
    activeEditorTabIndex: 0,
    editorTabs: [
      {
        filePath: getDefaultFilePath('sicp'),
        value: defaultEditorValue,
        highlightedLines: [],
        breakpoints: [],
      },
    ],
  },
};

export const defaultSession: SessionState = {
  courses: [],
  group: null,
  gameState: {
    completed_quests: [],
    collectibles: {},
  },
  xp: 0,
  story: {
    story: '',
    playStory: false,
  },
  assessments: {},
  assessmentOverviews: undefined,
  agreedToResearch: undefined,
  sessionId: Date.now(),
  githubOctokitObject: { octokit: undefined },
  gradingOverviews: undefined,
  students: undefined,
  teamFormationOverviews: undefined,
  gradings: {},
  notifications: [],
};

export const defaultFileSystem: FileSystemState = {
  inBrowserFileSystem: null,
};

export const defaultSideContent: SideContentState = {
  alerts: [],
};

export const defaultSideContentManager: SideContentManagerState = {
  assessment: defaultSideContent,
  grading: defaultSideContent,
  playground: defaultSideContent,
  sicp: defaultSideContent,
};

export const defaultVscode: VscodeState = {
  isVscode: false,
};

export const defaultLanguageDirectory: LanguageDirectoryState = {
  selectedLanguageId: null,
  selectedEvaluatorId: null,
  isDefaultSelection: true,
  languages: [],
  languageMap: {},
};

export const defaultPluginDirectory: PluginDirectoryState = {
  plugins: [],
  pluginMap: {},
};

export const defaultState: OverallState = {
  router: defaultRouter,
  achievement: defaultAchievement,
  leaderboard: defaultLeaderboard,
  dashboard: defaultDashboard,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager,
  featureFlags: defaultFeatureFlags,
  fileSystem: defaultFileSystem,
  sideContent: defaultSideContentManager,
  vscode: defaultVscode,
  languageDirectory: defaultLanguageDirectory,
  pluginDirectory: defaultPluginDirectory,
};
