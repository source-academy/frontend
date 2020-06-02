import { Context } from 'js-slang';

import { SourcecastWorkspaceState } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourcereelWorkspaceState } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import { InterpreterOutput } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { AutogradingResult, Testcase } from '../assessment/AssessmentTypes';
import { Position } from '../editor/EditorTypes';
import { SideContentType, SideContentTab } from '../sideContent/SideContentTypes';

export const BEGIN_CLEAR_CONTEXT = 'BEGIN_CLEAR_CONTEXT';
export const BROWSE_REPL_HISTORY_DOWN = 'BROWSE_REPL_HISTORY_DOWN';
export const BROWSE_REPL_HISTORY_UP = 'BROWSE_REPL_HISTORY_UP';
export const CHANGE_EDITOR_HEIGHT = 'CHANGE_EDITOR_HEIGHT';
export const CHANGE_EDITOR_WIDTH = 'CHANGE_EDITOR_WIDTH';
export const CHANGE_EXEC_TIME = 'CHANGE_EXEC_TIME';
export const CHANGE_EXTERNAL_LIBRARY = 'CHANGE_EXTERNAL_LIBRARY';
export const CHANGE_SIDE_CONTENT_HEIGHT = 'CHANGE_SIDE_CONTENT_HEIGHT';
export const CHAPTER_SELECT = 'CHAPTER_SELECT';
export const CLEAR_REPL_INPUT = 'CLEAR_REPL_INPUT';
export const CLEAR_REPL_OUTPUT = 'CLEAR_REPL_OUTPUT';
export const CLEAR_REPL_OUTPUT_LAST = 'CLEAR_REPL_OUTPUT_LAST';
export const END_CLEAR_CONTEXT = 'END_CLEAR_CONTEXT';
export const ENSURE_LIBRARIES_LOADED = 'ENSURE_LIBRARIES_LOADED';
export const EVAL_EDITOR = 'EVAL_EDITOR';
export const EVAL_REPL = 'EVAL_REPL';
export const PROMPT_AUTOCOMPLETE = 'PROMPT_AUTOCOMPLETE';
export const EVAL_SILENT = 'EVAL_SILENT';
export const EVAL_TESTCASE = 'EVAL_TESTCASE';
export const MOVE_CURSOR = 'MOVE_CURSOR';
export const NAV_DECLARATION = 'NAV_DECLARATION';
export const PLAYGROUND_EXTERNAL_SELECT = 'PLAYGROUND_EXTERNAL_SELECT ';
export const RESET_TESTCASE = 'RESET_TESTCASE';
export const RESET_WORKSPACE = 'RESET_WORKSPACE';
export const SEND_REPL_INPUT_TO_OUTPUT = 'SEND_REPL_INPUT_TO_OUTPUT';
export const TOGGLE_EDITOR_AUTORUN = 'TOGGLE_EDITOR_AUTORUN';
export const UPDATE_ACTIVE_TAB = 'UPDATE_ACTIVE_TAB';
export const UPDATE_CURRENT_ASSESSMENT_ID = 'UPDATE_CURRENT_ASSESSMENT_ID';
export const UPDATE_CURRENT_SUBMISSION_ID = 'UPDATE_CURRENT_SUBMISSION_ID';
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE';
export const UPDATE_EDITOR_BREAKPOINTS = 'UPDATE_EDITOR_BREAKPOINTS';
export const UPDATE_HAS_UNSAVED_CHANGES = 'UPDATE_HAS_UNSAVED_CHANGES';
export const UPDATE_REPL_VALUE = 'UPDATE_REPL_VALUE';
export const UPDATE_WORKSPACE = 'UPDATE_WORKSPACE';
export const FETCH_CHAPTER = 'FETCH_CHAPTER';
export const UPDATE_CHAPTER = 'UPDATE_CHAPTER';
export const CHANGE_CHAPTER = 'CHANGE_CHAPTER';

/**
 * Used to differenciate between the sources of actions, as
 * two workspaces can work at the same time. To generalise this
 * or add more instances of `Workspace`s, one can add a string,
 * and call the actions with the respective string (taken
 * from the below enum).
 *
 * Note that the names must correspond with the name of the
 * object in IWorkspaceManagerState.
 */
export enum WorkspaceLocations {
  assessment = 'assessment',
  playground = 'playground',
  grading = 'grading',
  sourcecast = 'sourcecast',
  sourcereel = 'sourcereel'
}

export type WorkspaceLocation = keyof typeof WorkspaceLocations;

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

export type WorkspaceManagerState = {
  readonly assessment: AssessmentWorkspaceState;
  readonly grading: GradingWorkspaceState;
  readonly playground: PlaygroundWorkspaceState;
  readonly sourcecast: SourcecastWorkspaceState;
  readonly sourcereel: SourcereelWorkspaceState;
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
  readonly highlightedLines: number[][];
  readonly newCursorPosition?: Position;
  readonly isRunning: boolean;
  readonly isDebugging: boolean;
  readonly enableDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly output: InterpreterOutput[];
  readonly externalLibrary: ExternalLibraryName;
  readonly replHistory: ReplHistory;
  readonly replValue: string;
  readonly sharedbAceInitValue: string;
  readonly sharedbAceIsInviting: boolean;
  readonly sideContentActiveTab: SideContentType;
  readonly sideContentHeight?: number;
  readonly websocketStatus: number;
  readonly globals: Array<[string, any]>;

  sideContentDynamicTabs: SideContentTab[];
};

type ReplHistory = {
  browseIndex: null | number; // [0, 49] if browsing, else null
  records: string[];
  originalValue: string;
};
