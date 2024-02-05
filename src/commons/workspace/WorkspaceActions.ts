import { Context } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';
import { action } from 'typesafe-actions';

import { SET_IS_EDITOR_READONLY } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SALanguage } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  UPDATE_EDITOR_HIGHLIGHTED_LINES,
  UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL
} from '../application/types/InterpreterTypes';
import { Library } from '../assessment/AssessmentTypes';
import { HighlightedLines, Position } from '../editor/EditorTypes';
import { NOTIFY_PROGRAM_EVALUATED } from '../sideContent/SideContentTypes';
import {
  ADD_EDITOR_TAB,
  ADD_HTML_CONSOLE_ERROR,
  BEGIN_CLEAR_CONTEXT,
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_EXEC_TIME,
  CHANGE_EXTERNAL_LIBRARY,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CHANGE_STEP_LIMIT,
  CHANGE_SUBLANGUAGE,
  CHAPTER_SELECT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  CLEAR_REPL_OUTPUT_LAST,
  EditorTabState,
  END_CLEAR_CONTEXT,
  EVAL_EDITOR,
  EVAL_EDITOR_AND_TESTCASES,
  EVAL_REPL,
  EVAL_TESTCASE,
  MOVE_CURSOR,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  PROMPT_AUTOCOMPLETE,
  REMOVE_EDITOR_TAB,
  REMOVE_EDITOR_TAB_FOR_FILE,
  REMOVE_EDITOR_TABS_FOR_DIRECTORY,
  RENAME_EDITOR_TAB_FOR_FILE,
  RENAME_EDITOR_TABS_FOR_DIRECTORY,
  RESET_TESTCASE,
  RESET_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  SET_FOLDER_MODE,
  SHIFT_EDITOR_TAB,
  SubmissionsTableFilters,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_FOLDER_MODE,
  TOGGLE_UPDATE_ENV,
  TOGGLE_USING_ENV,
  TOGGLE_USING_SUBST,
  UPDATE_ACTIVE_EDITOR_TAB,
  UPDATE_ACTIVE_EDITOR_TAB_INDEX,
  UPDATE_BREAKPOINTSTEPS,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_BREAKPOINTS,
  UPDATE_EDITOR_VALUE,
  UPDATE_ENVSTEPS,
  UPDATE_ENVSTEPSTOTAL,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE,
  UPDATE_SUBLANGUAGE,
  UPDATE_SUBMISSIONS_TABLE_FILTERS,
  UPDATE_WORKSPACE,
  WorkspaceLocation,
  WorkspaceLocationsWithTools,
  WorkspaceState
} from './WorkspaceTypes';

export const browseReplHistoryDown = (workspaceLocation: WorkspaceLocation) =>
  action(BROWSE_REPL_HISTORY_DOWN, { workspaceLocation });

export const browseReplHistoryUp = (workspaceLocation: WorkspaceLocation) =>
  action(BROWSE_REPL_HISTORY_UP, { workspaceLocation });

export const changeExternalLibrary = (newExternal: string, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EXTERNAL_LIBRARY, { newExternal, workspaceLocation });

export const changeExecTime = (execTime: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_EXEC_TIME, { execTime, workspaceLocation });

export const changeSideContentHeight = (height: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_SIDE_CONTENT_HEIGHT, { height, workspaceLocation });

export const changeStepLimit = (stepLimit: number, workspaceLocation: WorkspaceLocation) =>
  action(CHANGE_STEP_LIMIT, { stepLimit, workspaceLocation });

export const chapterSelect = (
  chapter: Chapter,
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
  action(EVAL_EDITOR_AND_TESTCASES, { workspaceLocation });

export const toggleFolderMode = (workspaceLocation: WorkspaceLocation) =>
  action(TOGGLE_FOLDER_MODE, { workspaceLocation });

export const setFolderMode = (workspaceLocation: WorkspaceLocation, isFolderModeEnabled: boolean) =>
  action(SET_FOLDER_MODE, { workspaceLocation, isFolderModeEnabled });

export const updateActiveEditorTabIndex = (
  workspaceLocation: WorkspaceLocation,
  activeEditorTabIndex: number | null
) => action(UPDATE_ACTIVE_EDITOR_TAB_INDEX, { workspaceLocation, activeEditorTabIndex });

export const updateActiveEditorTab = (
  workspaceLocation: WorkspaceLocation,
  activeEditorTabOptions?: Partial<EditorTabState>
) => action(UPDATE_ACTIVE_EDITOR_TAB, { workspaceLocation, activeEditorTabOptions });

export const updateEditorValue = (
  workspaceLocation: WorkspaceLocation,
  editorTabIndex: number,
  newEditorValue: string
) => action(UPDATE_EDITOR_VALUE, { workspaceLocation, editorTabIndex, newEditorValue });

export const setEditorBreakpoint = (
  workspaceLocation: WorkspaceLocation,
  editorTabIndex: number,
  newBreakpoints: string[]
) => action(UPDATE_EDITOR_BREAKPOINTS, { workspaceLocation, editorTabIndex, newBreakpoints });

export const setEditorHighlightedLines = (
  workspaceLocation: WorkspaceLocation,
  editorTabIndex: number,
  newHighlightedLines: HighlightedLines[]
) =>
  action(UPDATE_EDITOR_HIGHLIGHTED_LINES, {
    workspaceLocation,
    editorTabIndex,
    newHighlightedLines
  });

export const setEditorHighlightedLinesControl = (
  workspaceLocation: WorkspaceLocation,
  editorTabIndex: number,
  newHighlightedLines: HighlightedLines[]
) =>
  action(UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL, {
    workspaceLocation,
    editorTabIndex,
    newHighlightedLines
  });

export const moveCursor = (
  workspaceLocation: WorkspaceLocation,
  editorTabIndex: number,
  newCursorPosition: Position
) => action(MOVE_CURSOR, { workspaceLocation, editorTabIndex, newCursorPosition });

export const addEditorTab = (
  workspaceLocation: WorkspaceLocation,
  filePath: string,
  editorValue: string
) => action(ADD_EDITOR_TAB, { workspaceLocation, filePath, editorValue });

export const shiftEditorTab = (
  workspaceLocation: WorkspaceLocation,
  previousEditorTabIndex: number,
  newEditorTabIndex: number
) => action(SHIFT_EDITOR_TAB, { workspaceLocation, previousEditorTabIndex, newEditorTabIndex });

export const removeEditorTab = (workspaceLocation: WorkspaceLocation, editorTabIndex: number) =>
  action(REMOVE_EDITOR_TAB, { workspaceLocation, editorTabIndex });

export const removeEditorTabForFile = (
  workspaceLocation: WorkspaceLocation,
  removedFilePath: string
) => action(REMOVE_EDITOR_TAB_FOR_FILE, { workspaceLocation, removedFilePath });

export const removeEditorTabsForDirectory = (
  workspaceLocation: WorkspaceLocation,
  removedDirectoryPath: string
) => action(REMOVE_EDITOR_TABS_FOR_DIRECTORY, { workspaceLocation, removedDirectoryPath });

export const renameEditorTabForFile = (
  workspaceLocation: WorkspaceLocation,
  oldFilePath: string,
  newFilePath: string
) => action(RENAME_EDITOR_TAB_FOR_FILE, { workspaceLocation, oldFilePath, newFilePath });

export const renameEditorTabsForDirectory = (
  workspaceLocation: WorkspaceLocation,
  oldDirectoryPath: string,
  newDirectoryPath: string
) =>
  action(RENAME_EDITOR_TABS_FOR_DIRECTORY, {
    workspaceLocation,
    oldDirectoryPath,
    newDirectoryPath
  });

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

export const setIsEditorReadonly = (
  workspaceLocation: WorkspaceLocation,
  isEditorReadonly: boolean
) =>
  action(SET_IS_EDITOR_READONLY, {
    workspaceLocation,
    isEditorReadonly: isEditorReadonly
  });

export const updateSubmissionsTableFilters = (filters: SubmissionsTableFilters) =>
  action(UPDATE_SUBMISSIONS_TABLE_FILTERS, { filters });

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

export const changeSublanguage = (sublang: SALanguage) => action(CHANGE_SUBLANGUAGE, { sublang });

export const updateSublanguage = (sublang: SALanguage) => action(UPDATE_SUBLANGUAGE, { sublang });

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

export const toggleUsingSubst = (
  usingSubst: boolean,
  workspaceLocation: WorkspaceLocationsWithTools
) => action(TOGGLE_USING_SUBST, { usingSubst, workspaceLocation });

export const addHtmlConsoleError = (
  errorMsg: string,
  workspaceLocation: WorkspaceLocation,
  storyEnv?: string
) => action(ADD_HTML_CONSOLE_ERROR, { errorMsg, workspaceLocation, storyEnv });

export const toggleUsingEnv = (usingEnv: boolean, workspaceLocation: WorkspaceLocationsWithTools) =>
  action(TOGGLE_USING_ENV, { usingEnv, workspaceLocation });

export const toggleUpdateEnv = (
  updateEnv: boolean,
  workspaceLocation: WorkspaceLocationsWithTools
) => action(TOGGLE_UPDATE_ENV, { updateEnv, workspaceLocation });

export const updateEnvSteps = (steps: number, workspaceLocation: WorkspaceLocation) =>
  action(UPDATE_ENVSTEPS, { steps, workspaceLocation });

export const updateEnvStepsTotal = (steps: number, workspaceLocation: WorkspaceLocation) =>
  action(UPDATE_ENVSTEPSTOTAL, { steps, workspaceLocation });

export const updateBreakpointSteps = (
  breakpointSteps: number[],
  workspaceLocation: WorkspaceLocation
) => action(UPDATE_BREAKPOINTSTEPS, { breakpointSteps, workspaceLocation });
