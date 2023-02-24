import { Chapter, Language, SourceError, Variant } from 'js-slang/dist/types';

import { AcademyState } from '../../features/academy/AcademyTypes';
import { AchievementState } from '../../features/achievement/AchievementTypes';
import { DashboardState } from '../../features/dashboard/DashboardTypes';
import { Grading } from '../../features/grading/GradingTypes';
import { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { PlaybackStatus, RecordingStatus } from '../../features/sourceRecorder/SourceRecorderTypes';
import { Assessment } from '../assessment/AssessmentTypes';
import { FileSystemState } from '../fileSystem/FileSystemTypes';
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
  readonly fileSystem: FileSystemState;
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
 * Defines the languages available for use on Source Academy,
 * including Source sublanguages and other languages e.g. full JS.
 * For external libraries, see ExternalLibrariesTypes.ts
 */
export interface SALanguage extends Language {
  displayName: string;
}

const variantDisplay: Map<Variant, string> = new Map([
  [Variant.TYPED, 'Typed'],
  [Variant.WASM, 'WebAssembly'],
  [Variant.NON_DET, 'Non-Det'],
  [Variant.CONCURRENT, 'Concurrent'],
  [Variant.LAZY, 'Lazy'],
  [Variant.GPU, 'GPU'],
  [Variant.NATIVE, 'Native'],
  [Variant.EXPLICIT_CONTROL, 'Explicit-Control']
]);

export const fullJSLanguage: SALanguage = {
  chapter: Chapter.FULL_JS,
  variant: Variant.DEFAULT,
  displayName: 'full JavaScript'
};

export const htmlLanguage: SALanguage = {
  chapter: Chapter.HTML,
  variant: Variant.DEFAULT,
  displayName: 'HTML'
};

export const styliseSublanguage = (chapter: Chapter, variant: Variant = Variant.DEFAULT) => {
  switch (chapter) {
    case Chapter.FULL_JS:
      return fullJSLanguage.displayName;
    case Chapter.HTML:
      return htmlLanguage.displayName;
    default:
      return `Source \xa7${chapter}${
        variantDisplay.has(variant) ? ` ${variantDisplay.get(variant)}` : ''
      }`;
  }
};

export const sublanguages: Language[] = [
  { chapter: Chapter.SOURCE_1, variant: Variant.DEFAULT },
  { chapter: Chapter.SOURCE_1, variant: Variant.TYPED },
  { chapter: Chapter.SOURCE_1, variant: Variant.WASM },
  { chapter: Chapter.SOURCE_1, variant: Variant.LAZY },
  { chapter: Chapter.SOURCE_1, variant: Variant.NATIVE },
  { chapter: Chapter.SOURCE_2, variant: Variant.DEFAULT },
  { chapter: Chapter.SOURCE_2, variant: Variant.TYPED },
  { chapter: Chapter.SOURCE_2, variant: Variant.LAZY },
  { chapter: Chapter.SOURCE_2, variant: Variant.NATIVE },
  { chapter: Chapter.SOURCE_3, variant: Variant.DEFAULT },
  { chapter: Chapter.SOURCE_3, variant: Variant.TYPED },
  { chapter: Chapter.SOURCE_3, variant: Variant.CONCURRENT },
  { chapter: Chapter.SOURCE_3, variant: Variant.NON_DET },
  { chapter: Chapter.SOURCE_3, variant: Variant.NATIVE },
  { chapter: Chapter.SOURCE_4, variant: Variant.DEFAULT },
  { chapter: Chapter.SOURCE_4, variant: Variant.TYPED },
  { chapter: Chapter.SOURCE_4, variant: Variant.GPU },
  { chapter: Chapter.SOURCE_4, variant: Variant.NATIVE },
  { chapter: Chapter.SOURCE_4, variant: Variant.EXPLICIT_CONTROL }
];

export const sourceLanguages: SALanguage[] = sublanguages.map(sublang => {
  return {
    ...sublang,
    displayName: styliseSublanguage(sublang.chapter, sublang.variant)
  };
});

export const defaultLanguages = sourceLanguages.filter(
  sublang => sublang.variant === Variant.DEFAULT
);

export const variantLanguages = sourceLanguages.filter(
  sublang => sublang.variant !== Variant.DEFAULT
);

export const isSourceLanguage = (chapter: Chapter) =>
  [Chapter.SOURCE_1, Chapter.SOURCE_2, Chapter.SOURCE_3, Chapter.SOURCE_4].includes(chapter);

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
  context: createContext<WorkspaceLocation>(
    Constants.defaultSourceChapter,
    [],
    workspaceLocation,
    Constants.defaultSourceVariant
  ),
  activeEditorTabIndex: 0,
  editorTabs: [
    {
      value: ['playground', 'sourcecast', 'githubAssessments'].includes(workspaceLocation)
        ? defaultEditorValue
        : '',
      highlightedLines: [],
      breakpoints: []
    }
  ],
  programPrependValue: '',
  programPostpendValue: '',
  editorSessionId: '',
  isEditorReadonly: false,
  editorTestcases: [],
  externalLibrary: ExternalLibraryName.NONE,
  execTime: 1000,
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
    usingSubst: false,
    editorTabs: [
      {
        filePath: '/playground/program.js',
        value: defaultEditorValue,
        highlightedLines: [],
        breakpoints: []
      }
    ]
  },
  sourcecast: {
    ...createDefaultWorkspace('sourcecast'),
    audioUrl: '',
    codeDeltasToApply: null,
    currentPlayerTime: 0,
    description: null,
    inputToApply: null,
    playbackData: {
      init: {
        editorValue: '',
        chapter: Chapter.SOURCE_1,
        externalLibrary: ExternalLibraryName.NONE
      },
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
      init: {
        editorValue: '',
        chapter: Chapter.SOURCE_1,
        externalLibrary: ExternalLibraryName.NONE
      },
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

export const defaultFileSystem: FileSystemState = {
  inBrowserFileSystem: null
};

export const defaultState: OverallState = {
  academy: defaultAcademy,
  achievement: defaultAchievement,
  application: defaultApplication,
  dashboard: defaultDashboard,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager,
  fileSystem: defaultFileSystem
};
