import { type Context,Chapter, Variant } from "js-slang/dist/types";
import { ALL_LANGUAGES, InterpreterOutput,SALanguage } from "src/commons/application/ApplicationTypes";
import { AutogradingResult, Testcase } from "src/commons/assessment/AssessmentTypes";
import { HighlightedLines, Position } from "src/commons/editor/EditorTypes";
import { SideContentTab, SideContentType } from "src/commons/sideContent/SideContentTypes";
import Constants from "src/commons/utils/Constants";
import { createContext } from "src/commons/utils/JsSlangHelper";
import { GitHubSaveInfo } from "src/features/github/GitHubTypes";
import { PersistenceFile } from "src/features/persistence/PersistenceTypes";
import { CodeDelta, Input, PlaybackData, PlaybackStatus, RecordingStatus, SourcecastData } from "src/features/sourceRecorder/SourceRecorderTypes";
import { StoriesRole, StoryData, StoryListView } from "src/features/stories/StoriesTypes";

import { getDefaultFilePath } from "../AllTypes";

export type DebuggerContext = {
  result: any;
  lastDebuggerResult: any;
  code: string;
  context: Context;
  // workspaceLocation?: WorkspaceLocation;
}

export type EditorTabState = {
  readonly filePath?: string;
  readonly value: string;
  readonly highlightedLines: HighlightedLines[];
  readonly breakpoints: string[];
  readonly newCursorPosition?: Position;
};

export type EditorState = {
  readonly activeEditorTabIndex: number | null
  readonly editorSessionId: string
  readonly editorTabs: EditorTabState[]

  readonly isEditorAutorun: boolean
  readonly isEditorReadonly: boolean
  readonly isFolderModeEnabled: boolean
}

export const getDefaultEditorState = (defaultTabs: EditorTabState[] = []): EditorState => ({
  activeEditorTabIndex: 0,
  editorSessionId: '',
  editorTabs: defaultTabs,
  isEditorAutorun: false,
  isEditorReadonly: false,
  isFolderModeEnabled: false,
})

export const defaultEditorValue = '// Type your program in here!';

export type ReplState = {
  readonly output: InterpreterOutput[]
  readonly replHistory: {
    readonly browseIndex: null | number; // [0, 49] if browsing, else null
    readonly records: string[];
    readonly originalValue: string;
  }
  readonly replValue: string
}

export const defaultRepl: ReplState = {
  output: [],
  replHistory: {
    browseIndex: null,
    records: [],
    originalValue: ''
  },
  replValue: ''
}

export type SideContentState = {
  dynamicTabs: SideContentTab[]
  alerts: string[]
  selectedTabId?: SideContentType
  height?: number
}

export const defaultSideContent: SideContentState = {
  dynamicTabs: [],
  alerts: []
}

export type WorkspaceState = {
  readonly context: Context;
  readonly debuggerContext: DebuggerContext;

  readonly editorState: EditorState
  readonly enableDebugging: boolean;
  readonly execTime: number;

  readonly globals: Array<[string, any]>;

  readonly hasUnsavedChanges: boolean

  readonly isDebugging: boolean;
  readonly isRunning: boolean;

  readonly output: InterpreterOutput[];

  readonly programPrependValue: string;
  readonly programPostpendValue: string;
  readonly repl: ReplState;
  readonly sideContent: SideContentState

  readonly sharedbConnected: boolean
}

export const getDefaultWorkspaceState = (initialTabs: EditorTabState[] = []): WorkspaceState => ({
  context: createContext(
    Constants.defaultSourceChapter,
    [],
    {},
    Constants.defaultSourceVariant
  ),
  debuggerContext: {} as DebuggerContext,
  editorState: getDefaultEditorState(initialTabs),
  enableDebugging: true,
  execTime: 1000,
  hasUnsavedChanges: false,
  isDebugging: false,
  isRunning: false,
  globals: [],
  output: [],
  repl: defaultRepl,
  programPostpendValue: '',
  programPrependValue: '',
  sideContent: defaultSideContent,
  sharedbConnected: false,
})

export type AssessmentState = WorkspaceState & {
  readonly autogradingResults: AutogradingResult[]
  readonly editorTestcases: Testcase[]

  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
}

export type AssessmentLocations = 'grading' | 'assessment' | 'githubAssessment'

const getDefaultAssessmentState = (initialTabs: EditorTabState[] = []): AssessmentState => ({
  ...getDefaultWorkspaceState(initialTabs),
  autogradingResults: [],
  editorTestcases: []
})

export type AssessmentWorkspaceState = AssessmentState

export const defaultAssessment: AssessmentWorkspaceState = {
  // TODO add default tab
  ...getDefaultAssessmentState(),
}

export type SubmissionsTableFilters = {
  columnFilters: { id: string; value: unknown }[];
  globalFilter: string | null;
};

export type GradingWorkspaceState = AssessmentState & {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
  readonly submissionsTableFilters: SubmissionsTableFilters;
}

export const defaultGradingState: GradingWorkspaceState = ({
  ...getDefaultAssessmentState(),
  autogradingResults: [],
  submissionsTableFilters: {
    columnFilters: [],
    globalFilter: null
  },
  currentSubmission: undefined,
  currentQuestion: undefined,
  editorTestcases: [],
  hasUnsavedChanges: false
})

export type GitHubAssessmentWorkspaceState = AssessmentState

export const defaultGithubAssessment: GitHubAssessmentWorkspaceState = {
  ...getDefaultAssessmentState([{
    breakpoints: [],
    filePath: undefined,
    highlightedLines: [],
    value: defaultEditorValue,
  }]),
  editorTestcases: []
}

export type PlaygroundWorkspaceState = {
  readonly breakpointSteps: number[]
  readonly envSteps: number
  readonly envStepsTotal: number
  readonly stepLimit: number
  readonly updateEnv: boolean
  readonly usingEnv: boolean

  readonly usingSubst: boolean
} & WorkspaceState

export const getDefaultPlaygroundState = (initialTabs: EditorTabState[] = []): PlaygroundWorkspaceState => ({
  ...getDefaultWorkspaceState(initialTabs),
  breakpointSteps: [],
  envSteps: -1,
  envStepsTotal: 0,
  stepLimit: 1000,
  updateEnv: true,
  usingEnv: false,
  usingSubst: false,
  sharedbConnected: false
})

export type PlaygroundState = PlaygroundWorkspaceState & {
  readonly githubSaveInfo: GitHubSaveInfo
  readonly languageConfig: SALanguage
  readonly persistenceFile?: PersistenceFile
  readonly queryString?: string
  readonly shortURL?: string
}

export type PlaygroundWorkspaces = 'playground' | 'sicp' | 'sourcereel' | 'sourcecast' | `stories.${string}`

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
  ...getDefaultPlaygroundState([{
    breakpoints: [],
    filePath: getDefaultFilePath('playground'),
    highlightedLines: [],
    value: defaultEditorValue
  }]),
  githubSaveInfo: { repoName: '', filePath: '' },
  languageConfig: defaultLanguageConfig,
  sharedbConnected: false
}

export type SourcecastWorkspaceState = PlaygroundWorkspaceState & {
  readonly audioUrl: string;
  readonly codeDeltasToApply: CodeDelta[] | null;
  readonly currentPlayerTime: number;
  readonly description: string | null;
  readonly inputToApply: Input | null;
  readonly playbackData: PlaybackData;
  readonly playbackDuration: number;
  readonly playbackStatus: PlaybackStatus;
  readonly sourcecastIndex: SourcecastData[] | null;
  readonly title: string | null;
  readonly uid: string | null;
}

export const defaultSourcecast: SourcecastWorkspaceState = {
  ...getDefaultPlaygroundState(),
  audioUrl: '',
  codeDeltasToApply: null,
  currentPlayerTime: 0,
  description: null,
  inputToApply: null,
  playbackData: {
    init: {
      editorValue: '',
      chapter: Chapter.SOURCE_1,
    },
    inputs: []
  },
  playbackDuration: 0,
  playbackStatus: PlaybackStatus.paused,
  sourcecastIndex: null,
  title: null,
  uid: null
}

export type SourcereelWorkspaceState = {
  readonly playbackData: PlaybackData;
  readonly recordingStatus: RecordingStatus;
  readonly timeElapsedBeforePause: number;
  readonly timeResumed: number;
} & PlaygroundWorkspaceState

export const defaultSourcereel: SourcereelWorkspaceState = {
  ...getDefaultPlaygroundState(),
  playbackData: {
    init: {
      editorValue: '',
      chapter: Chapter.SOURCE_1,
    },
    inputs: []
  },
  recordingStatus: RecordingStatus.notStarted,
  timeElapsedBeforePause: 0,
  timeResumed: 0
}

export type SicpWorkspaceState = PlaygroundWorkspaceState
export const defaultSicp: SicpWorkspaceState = getDefaultPlaygroundState([{
  filePath: getDefaultFilePath('sicp'),
  value: defaultEditorValue,
  highlightedLines: [],
  breakpoints: []
}])

export type WorkspaceManagerState = {
  assessment: AssessmentWorkspaceState
  githubAssessment: GitHubAssessmentWorkspaceState
  grading: GradingWorkspaceState,
  playground: PlaygroundState
  stories: StoriesState
  sicp: SicpWorkspaceState
  sourcecast: SourcecastWorkspaceState
  sourcereel: SourcereelWorkspaceState
}

export type StoriesAuthState = {
  readonly userId?: number;
  readonly userName?: string;
  readonly groupId?: number;
  readonly groupName?: string;
  readonly role?: StoriesRole;
};

export type StoriesEnvState = PlaygroundWorkspaceState

export type StoriesState = {
  readonly storyList: StoryListView[];
  readonly currentStoryId: number | null;
  readonly currentStory: StoryData | null;
  readonly envs: { [key: string]: StoriesEnvState };
} & StoriesAuthState;

export const defaultStories: StoriesState = {
  storyList: [],
  currentStory: null,
  currentStoryId: null,
  envs: {}
}

export const getDefaultStoriesEnv = (
  env: string,
  chapter: Chapter = Constants.defaultSourceChapter,
  variant: Variant = Constants.defaultSourceVariant
): StoriesEnvState => ({
  ...getDefaultPlaygroundState(),
  context: createContext(
    chapter,
    [],
    env,
    variant
  )
})

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: defaultAssessment,
  githubAssessment: defaultGithubAssessment,
  grading: defaultGradingState,
  playground: defaultPlayground,
  sicp: defaultSicp,
  sourcecast: defaultSourcecast,
  sourcereel: defaultSourcereel,
  stories: defaultStories,
}

export type NonStoryWorkspaceLocation = Exclude<keyof WorkspaceManagerState, 'stories'>
export type StoryWorkspaceLocation = `stories.${string}`
export type SideContentLocation = NonStoryWorkspaceLocation | StoryWorkspaceLocation

export const isNonStoryWorkspaceLocation = (location: SideContentLocation): location is NonStoryWorkspaceLocation => !location.startsWith('stories')
