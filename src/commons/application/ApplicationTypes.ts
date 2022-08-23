import { SourceError, Variant } from 'js-slang/dist/types';

import { AcademyState } from '../../features/academy/AcademyTypes';
import { AchievementState } from '../../features/achievement/AchievementTypes';
import { DashboardState } from '../../features/dashboard/DashboardTypes';
import { Grading } from '../../features/grading/GradingTypes';
import { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { PlaybackStatus, RecordingStatus } from '../../features/sourceRecorder/SourceRecorderTypes';
import { Assessment } from '../assessment/AssessmentTypes';
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
 * Defines the Source sublanguages available for use.
 * For external libraries, see ExternalLibrariesTypes.ts
 */
export type SourceLanguage = {
  chapter: number;
  variant: Variant;
  displayName: string;
};

const variantDisplay: Map<Variant, string> = new Map([
  ['wasm', 'WebAssembly'],
  ['non-det', 'Non-Det'],
  ['concurrent', 'Concurrent'],
  ['lazy', 'Lazy'],
  ['gpu', 'GPU'],
  ['native', 'Native']
]);

// We will treat chapter === -1 as full JS for now
// This is because we want to separate it from being a Source sub-language
// and not to introduce unnecessary new types to handle "other" languages (for now)
export const fullJSLanguage: SourceLanguage = {
  chapter: -1,
  variant: 'default',
  displayName: 'full JavaScript'
};

export const isFullJSChapter = (chapter: number) => {
  return chapter === -1;
};

export const styliseSublanguage = (chapter: number, variant: Variant = 'default') => {
  return isFullJSChapter(chapter)
    ? fullJSLanguage.displayName
    : `Source \xa7${chapter}${
        variantDisplay.has(variant) ? ` ${variantDisplay.get(variant)}` : ''
      }`;
};

export const sublanguages: { chapter: number; variant: Variant }[] = [
  { chapter: 1, variant: 'default' },
  { chapter: 1, variant: 'wasm' },
  { chapter: 1, variant: 'lazy' },
  { chapter: 1, variant: 'native' },
  { chapter: 2, variant: 'default' },
  { chapter: 2, variant: 'lazy' },
  { chapter: 2, variant: 'native' },
  { chapter: 3, variant: 'default' },
  { chapter: 3, variant: 'concurrent' },
  { chapter: 3, variant: 'non-det' },
  { chapter: 3, variant: 'native' },
  { chapter: 4, variant: 'default' },
  { chapter: 4, variant: 'gpu' },
  { chapter: 4, variant: 'native' }
];

export const sourceLanguages = sublanguages.map(sublang => {
  return {
    ...sublang,
    displayName: styliseSublanguage(sublang.chapter, sublang.variant)
  };
});

export const defaultLanguages = sourceLanguages.filter(sublang => sublang.variant === 'default');
export const variantLanguages = sourceLanguages.filter(sublang => sublang.variant !== 'default');

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
  environment: currentEnvironment()
};

export const defaultDashboard: DashboardState = {
  gradingSummary: {
    cols: [],
    rows: []
  }
};

export const defaultAchievement: AchievementState = {
  achievements: [],
  goals: [],
  users: [],
  assessmentOverviews: []
};

export const defaultPlayground: PlaygroundState = {
  githubSaveInfo: { repoName: '', filePath: '' }
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
  editorValue: ['playground', 'sourcecast', 'githubAssessments'].includes(workspaceLocation)
    ? defaultEditorValue
    : '',
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
  sharedbConnected: false,
  stepLimit: 1000,
  globals: [],
  isEditorAutorun: false,
  isRunning: false,
  isDebugging: false,
  enableDebugging: true,
  debuggerContext: {} as DebuggerContext
});

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
  },
  sicp: {
    ...createDefaultWorkspace('sicp'),
    usingSubst: false
  },
  githubAssessment: {
    ...createDefaultWorkspace('githubAssessment'),
    hasUnsavedChanges: false
  }
};

export const defaultSession: SessionState = {
  courses: [],
  group: null,
  gameState: {
    completed_quests: [],
    collectibles: {}
  },
  xp: 0,
  story: {
    story: '',
    playStory: false
  },
  assessments: new Map<number, Assessment>(),
  assessmentOverviews: undefined,
  agreedToResearch: undefined,
  hadPreviousInfiniteLoop: false,
  sessionId: Date.now(),
  githubOctokitObject: { octokit: undefined },
  gradingOverviews: undefined,
  gradings: new Map<number, Grading>(),
  notifications: []
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
