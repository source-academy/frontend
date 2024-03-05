import { Chapter, Language, SourceError, Variant } from 'js-slang/dist/types';

import { AcademyState } from '../../features/academy/AcademyTypes';
import { AchievementState } from '../../features/achievement/AchievementTypes';
import { DashboardState } from '../../features/dashboard/DashboardTypes';
import { GradingQuery } from '../../features/grading/GradingTypes';
import { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { PlaybackStatus, RecordingStatus } from '../../features/sourceRecorder/SourceRecorderTypes';
import { StoriesEnvState, StoriesState } from '../../features/stories/StoriesTypes';
import { WORKSPACE_BASE_PATHS } from '../../pages/fileSystem/createInBrowserFileSystem';
import { Assessment } from '../assessment/AssessmentTypes';
import { FileSystemState } from '../fileSystem/FileSystemTypes';
import { SideContentManagerState, SideContentState } from '../sideContent/SideContentTypes';
import Constants from '../utils/Constants';
import { createContext } from '../utils/JsSlangHelper';
import {
  DebuggerContext,
  WorkspaceLocation,
  WorkspaceManagerState,
  WorkspaceState
} from '../workspace/WorkspaceTypes';
import { RouterState } from './types/CommonsTypes';
import { ExternalLibraryName } from './types/ExternalTypes';
import { SessionState } from './types/SessionTypes';

export type OverallState = {
  readonly router: RouterState;
  readonly academy: AcademyState;
  readonly achievement: AchievementState;
  readonly playground: PlaygroundState;
  readonly session: SessionState;
  readonly stories: StoriesState;
  readonly workspaces: WorkspaceManagerState;
  readonly dashboard: DashboardState;
  readonly fileSystem: FileSystemState;
  readonly sideContent: SideContentManagerState;
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
  Admin = 'admin'
}

// Must match https://github.com/source-academy/stories-backend/blob/main/internal/enums/groups/role.go
export enum StoriesRole {
  Standard = 'member',
  Moderator = 'moderator',
  Admin = 'admin'
}

export enum SupportedLanguage {
  JAVASCRIPT = 'JavaScript',
  SCHEME = 'Scheme',
  PYTHON = 'Python'
}

export const SUPPORTED_LANGUAGES = [
  SupportedLanguage.JAVASCRIPT,
  SupportedLanguage.SCHEME,
  SupportedLanguage.PYTHON
];

/**
 * Defines the languages available for use on Source Academy,
 * including Source sublanguages and other languages e.g. full JS.
 * For external libraries, see ExternalLibrariesTypes.ts
 */
export interface SALanguage extends Language {
  displayName: string;
  mainLanguage: SupportedLanguage;
  /** Whether the language supports the given features */
  supports: LanguageFeatures;
}
// TODO: Remove Partial type when fully migrated
type LanguageFeatures = Partial<{
  dataVisualizer: boolean;
  substVisualizer: boolean;
  cseMachine: boolean;
  multiFile: boolean;
  repl: boolean;
}>;

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
  displayName: 'full JavaScript',
  mainLanguage: SupportedLanguage.JAVASCRIPT,
  supports: { dataVisualizer: true, repl: true }
};

export const fullTSLanguage: SALanguage = {
  chapter: Chapter.FULL_TS,
  variant: Variant.DEFAULT,
  displayName: 'full TypeScript',
  mainLanguage: SupportedLanguage.JAVASCRIPT,
  supports: { dataVisualizer: true, repl: true }
};

export const htmlLanguage: SALanguage = {
  chapter: Chapter.HTML,
  variant: Variant.DEFAULT,
  displayName: 'HTML',
  mainLanguage: SupportedLanguage.JAVASCRIPT,
  supports: {}
};

const schemeSubLanguages: Array<Pick<SALanguage, 'chapter' | 'variant' | 'displayName'>> = [
  { chapter: Chapter.SCHEME_1, variant: Variant.EXPLICIT_CONTROL, displayName: 'Scheme \xa71' },
  { chapter: Chapter.SCHEME_2, variant: Variant.EXPLICIT_CONTROL, displayName: 'Scheme \xa72' },
  { chapter: Chapter.SCHEME_3, variant: Variant.EXPLICIT_CONTROL, displayName: 'Scheme \xa73' },
  { chapter: Chapter.SCHEME_4, variant: Variant.EXPLICIT_CONTROL, displayName: 'Scheme \xa74' },
  { chapter: Chapter.FULL_SCHEME, variant: Variant.EXPLICIT_CONTROL, displayName: 'Full Scheme' }
];

export const schemeLanguages: SALanguage[] = schemeSubLanguages.map(sublang => {
  return { ...sublang, mainLanguage: SupportedLanguage.SCHEME, supports: { repl: true } };
});

const pySubLanguages: Array<Pick<SALanguage, 'chapter' | 'variant' | 'displayName'>> = [
  { chapter: Chapter.PYTHON_1, variant: Variant.DEFAULT, displayName: 'Python \xa71' }
  //{ chapter: Chapter.PYTHON_2, variant: Variant.DEFAULT, displayName: 'Python \xa72' },
  //{ chapter: Chapter.PYTHON_3, variant: Variant.DEFAULT, displayName: 'Python \xa73' },
  //{ chapter: Chapter.PYTHON_4, variant: Variant.DEFAULT, displayName: 'Python \xa74' }
  //{ chapter: Chapter.FULL_PYTHON, variant: Variant.DEFAULT, displayName: 'Full Python' }
];

export const pyLanguages: SALanguage[] = pySubLanguages.map(sublang => {
  return { ...sublang, mainLanguage: SupportedLanguage.PYTHON, supports: { repl: true } };
});

export const styliseSublanguage = (chapter: Chapter, variant: Variant = Variant.DEFAULT) => {
  return getLanguageConfig(chapter, variant).displayName;
};

const sourceSubLanguages: Array<Pick<SALanguage, 'chapter' | 'variant'>> = [
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

export const sourceLanguages: SALanguage[] = sourceSubLanguages.map(sublang => {
  const { chapter, variant } = sublang;
  const supportedFeatures: LanguageFeatures = {};

  // Enable Data Visualizer for Source Chapter 2 and above
  supportedFeatures.dataVisualizer = chapter >= Chapter.SOURCE_2;

  // Enable Subst Visualizer only for default Source 1 & 2
  supportedFeatures.substVisualizer =
    chapter <= Chapter.SOURCE_2 &&
    (variant === Variant.DEFAULT || variant === Variant.NATIVE || variant === Variant.TYPED);

  // Enable CSE Machine for Source Chapter 3 and above
  supportedFeatures.cseMachine =
    chapter >= Chapter.SOURCE_3 && variant !== Variant.CONCURRENT && variant !== Variant.NON_DET;

  // Local imports/exports require Source 2+ as Source 1 does not have lists.
  supportedFeatures.multiFile = chapter >= Chapter.SOURCE_2;

  // Disable REPL for concurrent variants
  supportedFeatures.repl = variant !== Variant.CONCURRENT;

  return {
    ...sublang,
    displayName: `Source \xa7${chapter} ${variantDisplay.get(variant) ?? ''}`.trim(),
    mainLanguage: SupportedLanguage.JAVASCRIPT,
    supports: supportedFeatures
  };
});

export const isSourceLanguage = (chapter: Chapter) =>
  [Chapter.SOURCE_1, Chapter.SOURCE_2, Chapter.SOURCE_3, Chapter.SOURCE_4].includes(chapter);

export const ALL_LANGUAGES: readonly SALanguage[] = [
  ...sourceLanguages,
  fullJSLanguage,
  fullTSLanguage,
  htmlLanguage,
  ...schemeLanguages,
  ...pyLanguages
];
// TODO: Remove this function once logic has been fully migrated
export const getLanguageConfig = (
  chapter: Chapter,
  variant: Variant = Variant.DEFAULT
): SALanguage => {
  const languageConfig = ALL_LANGUAGES.find(
    lang => lang.chapter === chapter && lang.variant === variant
  );
  if (!languageConfig) {
    throw new Error(`Language config not found for chapter ${chapter} variant ${variant}`);
  }
  return languageConfig;
};

export const defaultRouter: RouterState = null;

export const defaultAcademy: AcademyState = {
  gameCanvas: undefined
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

const getDefaultLanguageConfig = (): SALanguage => {
  const languageConfig = ALL_LANGUAGES.find(
    sublang =>
      sublang.chapter === Constants.defaultSourceChapter &&
      sublang.variant === Constants.defaultSourceVariant
  );
  if (!languageConfig) {
    throw new Error('Cannot find language config to match default chapter and variant');
  }
  return languageConfig;
};
export const defaultLanguageConfig: SALanguage = getDefaultLanguageConfig();

export const defaultPlayground: PlaygroundState = {
  githubSaveInfo: { repoName: '', filePath: '' },
  languageConfig: defaultLanguageConfig
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
  isFolderModeEnabled: false,
  activeEditorTabIndex: 0,
  editorTabs: [
    {
      filePath: ['playground', 'sicp'].includes(workspaceLocation)
        ? getDefaultFilePath(workspaceLocation)
        : undefined,
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
  hasTokenCounter: false,
  tokenCount: 0,
  customNotification: '',
  sharedbConnected: false,
  stepLimit: 1000,
  globals: [],
  isEditorAutorun: false,
  isRunning: false,
  isDebugging: false,
  enableDebugging: true,
  debuggerContext: {} as DebuggerContext,
  sideContent: {
    alerts: [],
    dynamicTabs: []
  }
});

const defaultFileName = 'program.js';
export const getDefaultFilePath = (workspaceLocation: WorkspaceLocation) =>
  `${WORKSPACE_BASE_PATHS[workspaceLocation]}/${defaultFileName}`;

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: {
    ...createDefaultWorkspace('assessment'),
    currentAssessment: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  grading: {
    ...createDefaultWorkspace('grading'),
    submissionsTableFilters: {
      columnFilters: []
    },
    currentSubmission: undefined,
    currentQuestion: undefined,
    hasUnsavedChanges: false
  },
  playground: {
    ...createDefaultWorkspace('playground'),
    usingSubst: false,
    usingCse: false,
    updateCse: true,
    currentStep: -1,
    stepsTotal: 0,
    breakpointSteps: [],
    activeEditorTabIndex: 0,
    editorTabs: [
      {
        filePath: getDefaultFilePath('playground'),
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
    usingSubst: false,
    usingCse: false,
    updateCse: true,
    currentStep: -1,
    stepsTotal: 0,
    breakpointSteps: [],
    activeEditorTabIndex: 0,
    editorTabs: [
      {
        filePath: getDefaultFilePath('sicp'),
        value: defaultEditorValue,
        highlightedLines: [],
        breakpoints: []
      }
    ]
  },
  githubAssessment: {
    ...createDefaultWorkspace('githubAssessment'),
    hasUnsavedChanges: false
  },
  stories: {
    ...createDefaultWorkspace('stories')
    // TODO: Perhaps we can add default values?
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
  sessionId: Date.now(),
  githubOctokitObject: { octokit: undefined },
  gradingOverviews: undefined,
  gradings: new Map<number, GradingQuery>(),
  notifications: []
};

export const defaultStories: StoriesState = {
  storyList: [],
  currentStoryId: null,
  currentStory: null,
  envs: {}
};

export const createDefaultStoriesEnv = (
  envName: string,
  chapter: Chapter,
  variant: Variant
): StoriesEnvState => ({
  context: createContext<String>(chapter, [], envName, variant),
  execTime: 1000,
  isRunning: false,
  output: [],
  stepLimit: 1000,
  globals: [],
  usingSubst: false,
  debuggerContext: {} as DebuggerContext,
  sideContent: {
    dynamicTabs: [],
    alerts: []
  }
});

export const defaultFileSystem: FileSystemState = {
  inBrowserFileSystem: null
};

export const defaultSideContent: SideContentState = {
  dynamicTabs: [],
  alerts: []
};

export const defaultSideContentManager: SideContentManagerState = {
  assessment: defaultSideContent,
  grading: defaultSideContent,
  playground: defaultSideContent,
  githubAssessment: defaultSideContent,
  sicp: defaultSideContent,
  sourcecast: defaultSideContent,
  sourcereel: defaultSideContent,
  stories: {}
};

export const defaultState: OverallState = {
  router: defaultRouter,
  academy: defaultAcademy,
  achievement: defaultAchievement,
  dashboard: defaultDashboard,
  playground: defaultPlayground,
  session: defaultSession,
  stories: defaultStories,
  workspaces: defaultWorkspaceManager,
  fileSystem: defaultFileSystem,
  sideContent: defaultSideContentManager
};
