import { Chapter, Variant } from 'js-slang/dist/types';
import {
  ALL_LANGUAGES,
  SALanguage
} from 'src/commons/application/ApplicationTypes';
import { AutogradingResult, Testcase } from 'src/commons/assessment/AssessmentTypes';
import Constants from 'src/commons/utils/Constants';
import { createContext } from 'src/commons/utils/JsSlangHelper';
import { GitHubSaveInfo } from 'src/features/github/GitHubTypes';
import { PersistenceFile } from 'src/features/persistence/PersistenceTypes';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  RecordingStatus,
  SourcecastData
} from 'src/features/sourceRecorder/SourceRecorderTypes';
import { StoriesRole, StoryData, StoryListView } from 'src/features/stories/StoriesTypes';

import { defaultEditorValue,EditorTabState, getDefaultWorkspaceState, WorkspaceState } from './WorkspaceStateTypes';
/**
 * Maps workspaces to their file system base path.
 * An empty path indicates that the workspace is not
 * linked to the file system.
 */
export const WORKSPACE_BASE_PATHS: Record<keyof WorkspaceManagerState, string> = {
  assessment: '',
  githubAssessment: '',
  grading: '',
  playground: '/playground',
  sicp: '/sicp',
  sourcecast: '',
  sourcereel: '',
  stories: '' // TODO: Investigate if stories workspace base path is needed
};

export const getWorkspaceBasePath = (location: SideContentLocation) => {
  if (isNonStoryWorkspaceLocation(location)) {
    return WORKSPACE_BASE_PATHS[location];
  }

  const [, storyEnv] = location.split('.');
  return `${WORKSPACE_BASE_PATHS.stories}/${storyEnv}`;
};
const defaultFileName = 'program.js';
export const getDefaultFilePath = (workspaceLocation: SideContentLocation) =>
  `${getWorkspaceBasePath(workspaceLocation)}/${defaultFileName}`;


export type AssessmentState = WorkspaceState & {
  readonly autogradingResults: AutogradingResult[];
  readonly editorTestcases: Testcase[];

  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
};

export type AssessmentLocations = 'grading' | 'assessment' | 'githubAssessment';

const getDefaultAssessmentState = (initialTabs: EditorTabState[] = []): AssessmentState => ({
  ...getDefaultWorkspaceState(initialTabs),
  autogradingResults: [],
  editorTestcases: []
});

export type AssessmentWorkspaceState = AssessmentState;

export const defaultAssessment: AssessmentWorkspaceState = {
  // TODO add default tab
  ...getDefaultAssessmentState()
};

export type SubmissionsTableFilters = {
  columnFilters: { id: string; value: unknown }[];
  globalFilter: string | null;
};

export type GradingWorkspaceState = AssessmentState & {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
  readonly submissionsTableFilters: SubmissionsTableFilters;
};

export const defaultGradingState: GradingWorkspaceState = {
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
};

export type GitHubAssessmentWorkspaceState = AssessmentState;

export const defaultGithubAssessment: GitHubAssessmentWorkspaceState = {
  ...getDefaultAssessmentState([
    {
      breakpoints: [],
      filePath: undefined,
      highlightedLines: [],
      value: defaultEditorValue
    }
  ]),
  editorTestcases: []
};

export type PlaygroundWorkspaceState = {
  readonly breakpointSteps: number[];
  readonly envSteps: number;
  readonly envStepsTotal: number;
  readonly stepLimit: number;
  readonly updateEnv: boolean;
  readonly usingEnv: boolean;

  readonly usingSubst: boolean;
} & WorkspaceState;

export const getDefaultPlaygroundState = (
  initialTabs: EditorTabState[] = []
): PlaygroundWorkspaceState => ({
  ...getDefaultWorkspaceState(initialTabs),
  breakpointSteps: [],
  envSteps: -1,
  envStepsTotal: 0,
  stepLimit: 1000,
  updateEnv: true,
  usingEnv: false,
  usingSubst: false,
  sharedbConnected: false
});

export type PlaygroundState = PlaygroundWorkspaceState & {
  readonly githubSaveInfo: GitHubSaveInfo;
  readonly languageConfig: SALanguage;
  readonly persistenceFile?: PersistenceFile;
  readonly queryString?: string;
  readonly shortURL?: string;
};

export type PlaygroundWorkspaces =
  | 'playground'
  | 'sicp'
  | 'sourcereel'
  | 'sourcecast'
  | `stories.${string}`;

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
  ...getDefaultPlaygroundState([
    {
      breakpoints: [],
      filePath: getDefaultFilePath('playground'),
      highlightedLines: [],
      value: defaultEditorValue
    }
  ]),
  githubSaveInfo: { repoName: '', filePath: '' },
  languageConfig: defaultLanguageConfig,
  sharedbConnected: false
};

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
};

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
      chapter: Chapter.SOURCE_1
    },
    inputs: []
  },
  playbackDuration: 0,
  playbackStatus: PlaybackStatus.paused,
  sourcecastIndex: null,
  title: null,
  uid: null
};

export type SourcereelWorkspaceState = {
  readonly playbackData: PlaybackData;
  readonly recordingStatus: RecordingStatus;
  readonly timeElapsedBeforePause: number;
  readonly timeResumed: number;
} & PlaygroundWorkspaceState;

export const defaultSourcereel: SourcereelWorkspaceState = {
  ...getDefaultPlaygroundState(),
  playbackData: {
    init: {
      editorValue: '',
      chapter: Chapter.SOURCE_1
    },
    inputs: []
  },
  recordingStatus: RecordingStatus.notStarted,
  timeElapsedBeforePause: 0,
  timeResumed: 0
};

export type SicpWorkspaceState = PlaygroundWorkspaceState;
export const defaultSicp: SicpWorkspaceState = getDefaultPlaygroundState([
  {
    filePath: getDefaultFilePath('sicp'),
    value: defaultEditorValue,
    highlightedLines: [],
    breakpoints: []
  }
]);

export type WorkspaceManagerState = {
  assessment: AssessmentWorkspaceState;
  githubAssessment: GitHubAssessmentWorkspaceState;
  grading: GradingWorkspaceState;
  playground: PlaygroundState;
  stories: StoriesState;
  sicp: SicpWorkspaceState;
  sourcecast: SourcecastWorkspaceState;
  sourcereel: SourcereelWorkspaceState;
};

export type StoriesAuthState = {
  readonly userId?: number;
  readonly userName?: string;
  readonly groupId?: number;
  readonly groupName?: string;
  readonly role?: StoriesRole;
};

export type StoriesEnvState = PlaygroundWorkspaceState;

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
};

export const getDefaultStoriesEnv = (
  env: string,
  chapter: Chapter = Constants.defaultSourceChapter,
  variant: Variant = Constants.defaultSourceVariant
): StoriesEnvState => ({
  ...getDefaultPlaygroundState(),
  context: createContext(chapter, [], env, variant)
});

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: defaultAssessment,
  githubAssessment: defaultGithubAssessment,
  grading: defaultGradingState,
  playground: defaultPlayground,
  sicp: defaultSicp,
  sourcecast: defaultSourcecast,
  sourcereel: defaultSourcereel,
  stories: defaultStories
};

export type NonStoryWorkspaceLocation = Exclude<keyof WorkspaceManagerState, 'stories'>;
export type StoryWorkspaceLocation = `stories.${string}`;
export type SideContentLocation = NonStoryWorkspaceLocation | StoryWorkspaceLocation;

export function isNonStoryWorkspaceLocation(location: SideContentLocation): location is NonStoryWorkspaceLocation {
  return !location.startsWith('stories');
}
