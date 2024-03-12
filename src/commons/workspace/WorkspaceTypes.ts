import { Context } from 'js-slang';

import { GitHubAssessmentWorkspaceState } from '../../features/githubAssessment/GitHubAssessmentTypes';
import { SourcecastWorkspaceState } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourcereelWorkspaceState } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import { HighlightedLines, Position } from '../editor/EditorTypes';
import { SideContentState } from '../sideContent/SideContentTypes';

export const ADD_HTML_CONSOLE_ERROR = 'ADD_HTML_CONSOLE_ERROR';
export const BEGIN_CLEAR_CONTEXT = 'BEGIN_CLEAR_CONTEXT';
export const BROWSE_REPL_HISTORY_DOWN = 'BROWSE_REPL_HISTORY_DOWN';
export const BROWSE_REPL_HISTORY_UP = 'BROWSE_REPL_HISTORY_UP';
export const CHANGE_EXEC_TIME = 'CHANGE_EXEC_TIME';
export const CHANGE_EXTERNAL_LIBRARY = 'CHANGE_EXTERNAL_LIBRARY';
export const CHANGE_STEP_LIMIT = 'CHANGE_STEP_LIMIT';
export const CHAPTER_SELECT = 'CHAPTER_SELECT';
export const CLEAR_REPL_INPUT = 'CLEAR_REPL_INPUT';
export const CLEAR_REPL_OUTPUT = 'CLEAR_REPL_OUTPUT';
export const CLEAR_REPL_OUTPUT_LAST = 'CLEAR_REPL_OUTPUT_LAST';
export const END_CLEAR_CONTEXT = 'END_CLEAR_CONTEXT';
export const ENABLE_TOKEN_COUNTER = 'ENABLE_TOKEN_COUNTER';
export const DISABLE_TOKEN_COUNTER = 'DISABLE_TOKEN_COUNTER';
export const EVAL_EDITOR = 'EVAL_EDITOR';
export const EVAL_REPL = 'EVAL_REPL';
export const PROMPT_AUTOCOMPLETE = 'PROMPT_AUTOCOMPLETE';
export const EVAL_SILENT = 'EVAL_SILENT';
export const EVAL_TESTCASE = 'EVAL_TESTCASE';
export const EVAL_EDITOR_AND_TESTCASES = 'EVAL_EDITOR_AND_TESTCASES';
export const MOVE_CURSOR = 'MOVE_CURSOR';
export const NAV_DECLARATION = 'NAV_DECLARATION';
export const PLAYGROUND_EXTERNAL_SELECT = 'PLAYGROUND_EXTERNAL_SELECT ';
export const RESET_TESTCASE = 'RESET_TESTCASE';
export const RESET_WORKSPACE = 'RESET_WORKSPACE';
export const SEND_REPL_INPUT_TO_OUTPUT = 'SEND_REPL_INPUT_TO_OUTPUT';
export const SET_TOKEN_COUNT = 'SET_TOKEN_COUNT';
export const TOGGLE_EDITOR_AUTORUN = 'TOGGLE_EDITOR_AUTORUN';
export const TOGGLE_USING_SUBST = 'TOGGLE_USING_SUBST';
export const TOGGLE_USING_CSE = 'TOGGLE_USING_CSE';
export const TOGGLE_UPDATE_CSE = 'TOGGLE_UPDATE_CSE';
export const UPDATE_SUBMISSIONS_TABLE_FILTERS = 'UPDATE_SUBMISSIONS_TABLE_FILTERS';
export const UPDATE_CURRENT_ASSESSMENT_ID = 'UPDATE_CURRENT_ASSESSMENT_ID';
export const UPDATE_CURRENT_SUBMISSION_ID = 'UPDATE_CURRENT_SUBMISSION_ID';
export const TOGGLE_FOLDER_MODE = 'TOGGLE_FOLDER_MODE';
export const SET_FOLDER_MODE = 'SET_FOLDER_MODE';
export const UPDATE_ACTIVE_EDITOR_TAB_INDEX = 'UPDATE_ACTIVE_EDITOR_TAB_INDEX';
export const UPDATE_ACTIVE_EDITOR_TAB = 'UPDATE_ACTIVE_EDITOR_TAB';
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE';
export const UPDATE_EDITOR_BREAKPOINTS = 'UPDATE_EDITOR_BREAKPOINTS';
export const ADD_EDITOR_TAB = 'ADD_EDITOR_TAB';
export const SHIFT_EDITOR_TAB = 'SHIFT_EDITOR_TAB';
export const REMOVE_EDITOR_TAB = 'REMOVE_EDITOR_TAB';
export const REMOVE_EDITOR_TAB_FOR_FILE = 'REMOVE_EDITOR_TAB_FOR_FILE';
export const REMOVE_EDITOR_TABS_FOR_DIRECTORY = 'REMOVE_EDITOR_TABS_FOR_DIRECTORY';
export const RENAME_EDITOR_TAB_FOR_FILE = 'RENAME_EDITOR_TAB_FOR_FILE';
export const RENAME_EDITOR_TABS_FOR_DIRECTORY = 'RENAME_EDITOR_TABS_FOR_DIRECTORY';
export const UPDATE_HAS_UNSAVED_CHANGES = 'UPDATE_HAS_UNSAVED_CHANGES';
export const UPDATE_REPL_VALUE = 'UPDATE_REPL_VALUE';
export const UPDATE_WORKSPACE = 'UPDATE_WORKSPACE';
export const UPDATE_SUBLANGUAGE = 'UPDATE_SUBLANGUAGE';
export const UPDATE_CURRENTSTEP = 'UPDATE_CURRENTSTEP';
export const UPDATE_STEPSTOTAL = 'UPDATE_STEPSTOTAL';
export const UPDATE_BREAKPOINTSTEPS = 'UPDATE_BREAKPOINTSTEPS';
export const CHANGE_SUBLANGUAGE = 'CHANGE_SUBLANGUAGE';

export type WorkspaceLocation = keyof WorkspaceManagerState;
export type WorkspaceLocationsWithTools = Extract<WorkspaceLocation, 'playground' | 'sicp'>;

type AssessmentWorkspaceAttr = {
  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
};
type AssessmentWorkspaceState = AssessmentWorkspaceAttr & WorkspaceState;

type GradingWorkspaceAttr = {
  readonly submissionsTableFilters: SubmissionsTableFilters;
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
};
type GradingWorkspaceState = GradingWorkspaceAttr & WorkspaceState;

type PlaygroundWorkspaceAttr = {
  readonly usingSubst: boolean;
  readonly usingCse: boolean;
  readonly updateCse: boolean;
  readonly currentStep: number;
  readonly stepsTotal: number;
  readonly breakpointSteps: number[];
};
export type PlaygroundWorkspaceState = PlaygroundWorkspaceAttr & WorkspaceState;

export type SicpWorkspaceState = PlaygroundWorkspaceState;

export type WorkspaceManagerState = {
  readonly assessment: AssessmentWorkspaceState;
  readonly grading: GradingWorkspaceState;
  readonly playground: PlaygroundWorkspaceState;
  readonly sourcecast: SourcecastWorkspaceState;
  readonly sourcereel: SourcereelWorkspaceState;
  readonly sicp: SicpWorkspaceState;
  readonly githubAssessment: GitHubAssessmentWorkspaceState;
  readonly stories: StoriesWorkspaceState;
};

type StoriesWorkspaceAttr = {
  // TODO: Add stories workspace attributes
};
type StoriesWorkspaceState = StoriesWorkspaceAttr & WorkspaceState;

export type EditorTabState = {
  readonly filePath?: string;
  readonly value: string;
  readonly highlightedLines: HighlightedLines[];
  readonly breakpoints: string[];
  readonly newCursorPosition?: Position;
};

export type WorkspaceState = {
  readonly autogradingResults: AutogradingResult[];
  readonly context: Context;
  readonly isFolderModeEnabled: boolean;
  readonly activeEditorTabIndex: number | null;
  readonly editorTabs: EditorTabState[];
  readonly programPrependValue: string;
  readonly programPostpendValue: string;
  readonly editorSessionId: string;
  readonly editorTestcases: Testcase[];
  readonly execTime: number;
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly isEditorReadonly: boolean;
  readonly output: InterpreterOutput[];
  readonly externalLibrary: ExternalLibraryName;
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly hasTokenCounter: boolean;
  readonly tokenCount: integer;
  readonly customNotification: string;
  readonly sharedbConnected: boolean;
  readonly stepLimit: number;
  readonly globals: Array<[string, any]>;
  readonly debuggerContext: DebuggerContext;
  readonly sideContent: SideContentState;
};

type ReplHistory = {
  browseIndex: null | number; // [0, 49] if browsing, else null
  records: string[];
  originalValue: string;
};

export type DebuggerContext = {
  result: any;
  lastDebuggerResult: any;
  code: string;
  context: Context;
  workspaceLocation?: WorkspaceLocation;
};

export type SubmissionsTableFilters = {
  columnFilters: { id: string; value: unknown }[];
};
