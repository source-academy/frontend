import { Context } from 'js-slang';
import { Variant } from 'js-slang/dist/types';
import { action } from 'typesafe-actions';

import { SET_EDITOR_READONLY } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourceLanguage } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { HIGHLIGHT_LINE } from '../application/types/InterpreterTypes';
import { Library } from '../assessment/AssessmentTypes';
import { Position } from '../editor/EditorTypes';
import { NOTIFY_PROGRAM_EVALUATED } from '../sideContent/SideContentTypes';
import {
  BEGIN_CLEAR_CONTEXT,
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_EDITOR_HEIGHT,
  CHANGE_EDITOR_WIDTH,
  CHANGE_EXEC_TIME,
  CHANGE_EXTERNAL_LIBRARY,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CHANGE_STEP_LIMIT,
  CHANGE_SUBLANGUAGE,
  CHAPTER_SELECT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  CLEAR_REPL_OUTPUT_LAST,
  END_CLEAR_CONTEXT,
  EVAL_EDITOR,
  EVAL_REPL,
  EVAL_TESTCASE,
  FETCH_SUBLANGUAGE,
  MOVE_CURSOR,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  PROMPT_AUTOCOMPLETE,
  RESET_TESTCASE,
  RESET_WORKSPACE,
  RUN_ALL_TESTCASES,
  SEND_REPL_INPUT_TO_OUTPUT,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_USING_SUBST,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_BREAKPOINTS,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE,
  UPDATE_SUBLANGUAGE,
  UPDATE_WORKSPACE,
  WorkspaceLocation,
  WorkspaceState
} from './WorkspaceTypes';

export const browseReplHistoryDown = (workspaceLocation: WorkspaceLocation) =>
  action(BROWSE_REPL_HISTORY_DOWN, { workspaceLocation });

export const browseReplHistoryUp = (workspaceLocation: WorkspaceLocation) =>
  action(BROWSE_REPL_HISTORY_UP, { workspaceLocation });

export const changeExternalLibrary = (newExternal: string, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EXTERNAL_LIBRARY, { newExternal, workspaceLocation });

export const changeEditorHeight = (height: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EDITOR_HEIGHT, { height, workspaceLocation });

export const changeEditorWidth = (widthChange: string, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EDITOR_WIDTH, { widthChange, workspaceLocation });

export const changeExecTime = (execTime: string, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EXEC_TIME, { execTime, workspaceLocation });

export const changeSideContentHeight = (height: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_SIDE_CONTENT_HEIGHT, { height, workspaceLocation });

export const changeStepLimit = (stepLimit: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_STEP_LIMIT, { stepLimit, workspaceLocation });

export const chapterSelect = (
  chapter: number,
  variant: Variant,
  workspaceLocation: WorkspaceLocation
) =>
  action(CHAPTER_SELECT, {
    chapter,
    variant,
    workspaceLocation
  });

export const externalLibrarySelect = (
  externalLibraryName: ExternalLibraryName,
  workspaceLocation: WorkspaceLocation,
  initialise?: boolean
) =>
  action(PLAYGROUND_EXTERNAL_SELECT, {
    externalLibraryName,
    workspaceLocation,
    initialise: initialise || false
  });

export const toggleEditorAutorun = (workspaceLocation: WorkspaceLocation) =>
  action(TOGGLE_EDITOR_AUTORUN, { workspaceLocation });

/**
 * Starts the process to clear the js-slang Context
 * at a specified workspace location.
 *
 * This action is to be handled by saga, in order to
 * call upon side effects such as loading libraries in
 * the global scope.
 *
 * @param library the Library that the context shall be using
 * @param workspaceLocation the location of the workspace
 *
 * @see Library in assessmentShape.ts
 */
export const beginClearContext = (
  workspaceLocation: WorkspaceLocation,
  library: Library,
  shouldInitLibrary: boolean
) =>
  action(BEGIN_CLEAR_CONTEXT, {
    library,
    workspaceLocation,
    shouldInitLibrary
  });

export const clearReplInput = (workspaceLocation: WorkspaceLocation) =>
  action(CLEAR_REPL_INPUT, { workspaceLocation });

export const clearReplOutput = (workspaceLocation: WorkspaceLocation) =>
  action(CLEAR_REPL_OUTPUT, { workspaceLocation });

export const clearReplOutputLast = (workspaceLocation: WorkspaceLocation) =>
  action(CLEAR_REPL_OUTPUT_LAST, { workspaceLocation });

/**
 * Finishes the process to clear the js-slang Context
 * at a specified workspace location.
 *
 * This action is to be handled in the reducer, to call the reset on the
 * Context in the state.
 *
 * @param library the Library that the context shall be using
 * @param workspaceLocation the location of the workspace
 *
 * @see Library in assessmentShape.ts
 */
export const endClearContext = (library: Library, workspaceLocation: WorkspaceLocation) =>
  action(END_CLEAR_CONTEXT, {
    library,
    workspaceLocation
  });

export const evalEditor = (workspaceLocation: WorkspaceLocation) =>
  action(EVAL_EDITOR, { workspaceLocation });

export const evalRepl = (workspaceLocation: WorkspaceLocation) =>
  action(EVAL_REPL, { workspaceLocation });

export const evalTestcase = (workspaceLocation: WorkspaceLocation, testcaseId: number) =>
  action(EVAL_TESTCASE, { workspaceLocation, testcaseId });

export const runAllTestcases = (workspaceLocation: WorkspaceLocation) =>
  action(RUN_ALL_TESTCASES, { workspaceLocation });

export const updateEditorValue = (newEditorValue: string, workspaceLocation: WorkspaceLocation) =>
  action(UPDATE_EDITOR_VALUE, { newEditorValue, workspaceLocation });

export const setEditorBreakpoint = (breakpoints: string[], workspaceLocation: WorkspaceLocation) =>
  action(UPDATE_EDITOR_BREAKPOINTS, { breakpoints, workspaceLocation });

export const highlightEditorLine = (
  highlightedLines: number[],
  workspaceLocation: WorkspaceLocation
) => action(HIGHLIGHT_LINE, { highlightedLines, workspaceLocation });

export const updateReplValue = (newReplValue: string, workspaceLocation: WorkspaceLocation) =>
  action(UPDATE_REPL_VALUE, { newReplValue, workspaceLocation });

export const sendReplInputToOutput = (newOutput: string, workspaceLocation: WorkspaceLocation) =>
  action(SEND_REPL_INPUT_TO_OUTPUT, {
    type: 'code',
    workspaceLocation,
    value: newOutput
  });

export const resetTestcase = (workspaceLocation: WorkspaceLocation, index: number) =>
  action(RESET_TESTCASE, { workspaceLocation, index });

export const navigateToDeclaration = (
  workspaceLocation: WorkspaceLocation,
  cursorPosition: Position
) => action(NAV_DECLARATION, { workspaceLocation, cursorPosition });

export const moveCursor = (workspaceLocation: WorkspaceLocation, cursorPosition: Position) =>
  action(MOVE_CURSOR, { workspaceLocation, cursorPosition });

/**
 * Resets a workspace to its default properties.
 *
 * @param workspaceLocation the workspace to be reset
 * @param workspaceOptions an object with any number of properties
 *   in IWorkspaceState, that will take precedence over the default
 *   values. For example, one can use this to specify a particular
 *   editorValue.
 */
export const resetWorkspace = (
  workspaceLocation: WorkspaceLocation,
  workspaceOptions?: Partial<WorkspaceState>
) =>
  action(RESET_WORKSPACE, {
    workspaceLocation,
    workspaceOptions
  });

export const updateWorkspace = (
  workspaceLocation: WorkspaceLocation,
  workspaceOptions?: Partial<WorkspaceState>
) =>
  action(UPDATE_WORKSPACE, {
    workspaceLocation,
    workspaceOptions
  });

export const setEditorReadonly = (workspaceLocation: WorkspaceLocation, editorReadonly: boolean) =>
  action(SET_EDITOR_READONLY, {
    workspaceLocation,
    editorReadonly
  });

export const updateCurrentAssessmentId = (assessmentId: number, questionId: number) =>
  action(UPDATE_CURRENT_ASSESSMENT_ID, {
    assessmentId,
    questionId
  });

export const updateCurrentSubmissionId = (submissionId: number, questionId: number) =>
  action(UPDATE_CURRENT_SUBMISSION_ID, {
    submissionId,
    questionId
  });

export const updateHasUnsavedChanges = (
  workspaceLocation: WorkspaceLocation,
  hasUnsavedChanges: boolean
) =>
  action(UPDATE_HAS_UNSAVED_CHANGES, {
    workspaceLocation,
    hasUnsavedChanges
  });

export const fetchSublanguage = () => action(FETCH_SUBLANGUAGE);

export const changeSublanguage = (sublang: SourceLanguage) =>
  action(CHANGE_SUBLANGUAGE, { sublang });

export const updateSublanguage = (sublang: SourceLanguage) =>
  action(UPDATE_SUBLANGUAGE, { sublang });

export const promptAutocomplete = (
  workspaceLocation: WorkspaceLocation,
  row: number,
  column: number,
  callback: any // TODO: define a type for this
) =>
  action(PROMPT_AUTOCOMPLETE, {
    workspaceLocation,
    row,
    column,
    callback
  });

export const notifyProgramEvaluated = (
  result: any,
  lastDebuggerResult: any,
  code: string,
  context: Context,
  workspaceLocation?: WorkspaceLocation
) =>
  action(NOTIFY_PROGRAM_EVALUATED, {
    result,
    lastDebuggerResult,
    code,
    context,
    workspaceLocation
  });

export const toggleUsingSubst = (usingSubst: boolean, workspaceLocation: WorkspaceLocation) =>
  action(TOGGLE_USING_SUBST, { usingSubst, workspaceLocation });
