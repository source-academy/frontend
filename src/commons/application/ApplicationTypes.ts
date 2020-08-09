import { SourceError, Variant } from 'js-slang/dist/types';

import { AcademyState } from '../../features/academy/AcademyTypes';
import { AchievementState } from '../../features/achievement/AchievementTypes';
import { DashboardState } from '../../features/dashboard/DashboardTypes';
import { Grading } from '../../features/grading/GradingTypes';
import { playgroundQuestionId } from '../../features/keystrokes/KeystrokesHelper';
import { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { PlaybackStatus, RecordingStatus } from '../../features/sourceRecorder/SourceRecorderTypes';
import { Assessment } from '../assessment/AssessmentTypes';
import { SideContentType } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import { createContext } from '../utils/JsSlangHelper';
import {
  DebuggerContext,
  WorkspaceLocation,
  WorkspaceManagerState,
  WorkspaceState
} from '../workspace/WorkspaceTypes';
import { ExternalLibraryName } from './types/ExternalTypes';
import { SessionState } from './types/SessionTypes';

export type OverallState = {
  readonly academy: AcademyState;
  readonly achievement: AchievementState;
  readonly application: ApplicationState;
  readonly playground: PlaygroundState;
  readonly session: SessionState;
  readonly workspaces: WorkspaceManagerState;
  readonly dashboard: DashboardState;
};

export type ApplicationState = {
  readonly title: string;
  readonly environment: ApplicationEnvironment;
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
  value: any;
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
  errors: SourceError[];
  consoleLogs: string[];
};

export type InterpreterOutput = RunningOutput | CodeOutput | ResultOutput | ErrorOutput;

export enum ApplicationEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export enum Role {
  Student = 'student',
  Staff = 'staff',
  Admin = 'admin'
}

/**
 * Defines what chapters are available for usage.
 * For external libraries, see ExternalLibrariesTypes.ts
 */
export type SourceLanguage = {
  chapter: number;
  variant: Variant;
};

export const sourceLanguages: SourceLanguage[] = [
  { chapter: 1, variant: 'default' },
  { chapter: 1, variant: 'wasm' },
  { chapter: 1, variant: 'lazy' },
  { chapter: 2, variant: 'default' },
  { chapter: 2, variant: 'lazy' },
  { chapter: 3, variant: 'default' },
  { chapter: 3, variant: 'concurrent' },
  { chapter: 3, variant: 'non-det' },
  { chapter: 4, variant: 'default' },
  { chapter: 4, variant: 'gpu' }
];

const variantDisplay: Map<Variant, string> = new Map([
  ['wasm', 'WebAssembly'],
  ['non-det', 'Non-Det'],
  ['concurrent', 'Concurrent'],
  ['lazy', 'Lazy'],
  ['gpu', 'GPU']
]);

export const styliseChapter = (chap: number, variant: Variant = 'default') => {
  let res = `Source \xa7${chap}`;
  if (variantDisplay.has(variant)) {
    res += ' ' + variantDisplay.get(variant);
  }
  return res;
};

const currentEnvironment = (): ApplicationEnvironment => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return ApplicationEnvironment.Development;
    case 'production':
      return ApplicationEnvironment.Production;
    default:
      return ApplicationEnvironment.Test;
  }
};

export const defaultAcademy: AcademyState = {
  gameCanvas: undefined
};

export const defaultApplication: ApplicationState = {
  title: 'Cadet',
  environment: currentEnvironment()
};

export const defaultDashboard: DashboardState = {
  gradingSummary: []
};

export const defaultAchievement: AchievementState = {
  achievements: [],
  goals: []
};

export const defaultPlayground: PlaygroundState = {
  usingSubst: false
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
  breakpoints: [],
  context: createContext<WorkspaceLocation>(
    Constants.defaultSourceChapter,
    [],
    workspaceLocation,
    Constants.defaultSourceVariant as Variant
  ),
  editorPrepend: '',
  editorSessionId: '',
  editorValue: workspaceLocation === 'playground' || 'sourcecast' ? defaultEditorValue : '',
  editorPostpend: '',
  editorReadonly: false,
  editorTestcases: [],
  editorHeight: 150,
  editorWidth: '50%',
  externalLibrary: ExternalLibraryName.NONE,
  execTime: 1000,
  highlightedLines: [],
  output: [],
  replHistory: {
    browseIndex: null,
    records: [],
    originalValue: ''
  },
  replValue: '',
  sharedbAceInitValue: '',
  sharedbAceIsInviting: false,
  sideContentActiveTab: SideContentType.questionOverview,
  stepLimit: 1000,
  websocketStatus: 0,
  globals: [],
  isEditorAutorun: false,
  isRunning: false,
  isDebugging: false,
  enableDebugging: true,
  debuggerContext: {} as DebuggerContext
});

export const defaultRoomId = null;

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: {
    ...createDefaultWorkspace('assessment'),
    currentAssessment: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  grading: {
    ...createDefaultWorkspace('grading'),
    currentSubmission: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  playground: {
    ...createDefaultWorkspace('playground'),
    usingSubst: false
  },
  sourcecast: {
    ...createDefaultWorkspace('sourcecast'),
    audioUrl: '',
    codeDeltasToApply: null,
    currentPlayerTime: 0,
    description: null,
    inputToApply: null,
    playbackData: {
      init: { editorValue: '', chapter: 1, externalLibrary: ExternalLibraryName.NONE },
      inputs: []
    },
    playbackDuration: 0,
    playbackStatus: PlaybackStatus.paused,
    sourcecastIndex: null,
    title: null,
    uid: null
  },
  sourcereel: {
    ...createDefaultWorkspace('sourcereel'),
    playbackData: {
      init: { editorValue: '', chapter: 1, externalLibrary: ExternalLibraryName.NONE },
      inputs: []
    },
    recordingStatus: RecordingStatus.notStarted,
    timeElapsedBeforePause: 0,
    timeResumed: 0
  }
};

export const defaultSession: SessionState = {
  accessToken: undefined,
  assessments: new Map<number, Assessment>(),
  assessmentOverviews: undefined,
  grade: 0,
  gradingOverviews: undefined,
  gradings: new Map<number, Grading>(),
  group: null,
  historyHelper: {
    lastAcademyLocations: [null, null],
    lastGeneralLocations: [null, null]
  },
  maxGrade: 0,
  maxXp: 0,
  refreshToken: undefined,
  role: undefined,
  name: undefined,
  story: {
    story: '',
    playStory: false
  },
  gameState: {
    completed_quests: [],
    collectibles: {}
  },
  xp: 0,
  notifications: [],

  keystrokeLogs: [],
  loggedQuestionId: playgroundQuestionId
};

export const defaultState: OverallState = {
  academy: defaultAcademy,
  achievement: defaultAchievement,
  application: defaultApplication,
  dashboard: defaultDashboard,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager
};
