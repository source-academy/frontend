import { Context } from 'js-slang';

import { GitHubAssessmentWorkspaceState } from '../../features/githubAssessment/GitHubAssessmentTypes';
import { SourcecastWorkspaceState } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourcereelWorkspaceState } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import { HighlightedLines, Position } from '../editor/EditorTypes';

export const BEGIN_CLEAR_CONTEXT = 'BEGIN_CLEAR_CONTEXT';
export const BROWSE_REPL_HISTORY_DOWN = 'BROWSE_REPL_HISTORY_DOWN';
export const BROWSE_REPL_HISTORY_UP = 'BROWSE_REPL_HISTORY_UP';
export const CHANGE_EDITOR_HEIGHT = 'CHANGE_EDITOR_HEIGHT';
export const CHANGE_EDITOR_WIDTH = 'CHANGE_EDITOR_WIDTH';
export const CHANGE_EXEC_TIME = 'CHANGE_EXEC_TIME';
export const CHANGE_EXTERNAL_LIBRARY = 'CHANGE_EXTERNAL_LIBRARY';
export const CHANGE_SIDE_CONTENT_HEIGHT = 'CHANGE_SIDE_CONTENT_HEIGHT';
export const CHANGE_STEP_LIMIT = 'CHANGE_STEP_LIMIT';
export const CHAPTER_SELECT = 'CHAPTER_SELECT';
export const CLEAR_REPL_INPUT = 'CLEAR_REPL_INPUT';
export const CLEAR_REPL_OUTPUT = 'CLEAR_REPL_OUTPUT';
export const CLEAR_REPL_OUTPUT_LAST = 'CLEAR_REPL_OUTPUT_LAST';
export const END_CLEAR_CONTEXT = 'END_CLEAR_CONTEXT';
export const EVAL_EDITOR = 'EVAL_EDITOR';
export const EVAL_REPL = 'EVAL_REPL';
export const PROMPT_AUTOCOMPLETE = 'PROMPT_AUTOCOMPLETE';
export const EVAL_SILENT = 'EVAL_SILENT';
export const EVAL_TESTCASE = 'EVAL_TESTCASE';
export const RUN_ALL_TESTCASES = 'RUN_ALL_TESTCASES';
export const MOVE_CURSOR = 'MOVE_CURSOR';
export const NAV_DECLARATION = 'NAV_DECLARATION';
export const PLAYGROUND_EXTERNAL_SELECT = 'PLAYGROUND_EXTERNAL_SELECT ';
export const RESET_TESTCASE = 'RESET_TESTCASE';
export const RESET_WORKSPACE = 'RESET_WORKSPACE';
export const SEND_REPL_INPUT_TO_OUTPUT = 'SEND_REPL_INPUT_TO_OUTPUT';
export const TOGGLE_EDITOR_AUTORUN = 'TOGGLE_EDITOR_AUTORUN';
export const TOGGLE_USING_SUBST = 'TOGGLE_USING_SUBST';
export const UPDATE_CURRENT_ASSESSMENT_ID = 'UPDATE_CURRENT_ASSESSMENT_ID';
export const UPDATE_CURRENT_SUBMISSION_ID = 'UPDATE_CURRENT_SUBMISSION_ID';
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE';
export const UPDATE_EDITOR_BREAKPOINTS = 'UPDATE_EDITOR_BREAKPOINTS';
export const UPDATE_HAS_UNSAVED_CHANGES = 'UPDATE_HAS_UNSAVED_CHANGES';
export const UPDATE_REPL_VALUE = 'UPDATE_REPL_VALUE';
export const UPDATE_WORKSPACE = 'UPDATE_WORKSPACE';
export const FETCH_SUBLANGUAGE = 'FETCH_SUBLANGUAGE';
export const UPDATE_SUBLANGUAGE = 'UPDATE_SUBLANGUAGE';
export const CHANGE_SUBLANGUAGE = 'CHANGE_SUBLANGUAGE';

export type WorkspaceLocation = keyof WorkspaceManagerState;

type AssessmentWorkspaceAttr = {
  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
};
type AssessmentWorkspaceState = AssessmentWorkspaceAttr & WorkspaceState;

type GradingWorkspaceAttr = {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
};
type GradingWorkspaceState = GradingWorkspaceAttr & WorkspaceState;

type PlaygroundWorkspaceAttr = {
  readonly usingSubst: boolean;
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
};

export type WorkspaceState = {
  readonly autogradingResults: AutogradingResult[];
  readonly breakpoints: string[];
  readonly context: Context;
  readonly editorPrepend: string;
  readonly editorReadonly: boolean;
  readonly editorSessionId: string;
  readonly editorValue: string | null;
  readonly editorPostpend: string;
  readonly editorTestcases: Testcase[];
  readonly editorHeight: number;
  readonly editorWidth: string;
  readonly execTime: number;
  readonly highlightedLines: HighlightedLines[];
  readonly newCursorPosition?: Position;
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly output: InterpreterOutput[];
  readonly externalLibrary: ExternalLibraryName;
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly sharedbConnected: boolean;
  readonly sideContentHeight?: number;
  readonly stepLimit: number;
  readonly globals: Array<[string, any]>;
  readonly debuggerContext: DebuggerContext;
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
