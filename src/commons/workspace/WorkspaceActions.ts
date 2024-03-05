import { createAction } from '@reduxjs/toolkit';
import { Context } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';

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
  CHANGE_STEP_LIMIT,
  CHANGE_SUBLANGUAGE,
  CHAPTER_SELECT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  CLEAR_REPL_OUTPUT_LAST,
  DISABLE_TOKEN_COUNTER,
  EditorTabState,
  ENABLE_TOKEN_COUNTER,
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
  SET_TOKEN_COUNT,
  SHIFT_EDITOR_TAB,
  SubmissionsTableFilters,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_FOLDER_MODE,
  TOGGLE_UPDATE_CSE,
  TOGGLE_USING_CSE,
  TOGGLE_USING_SUBST,
  UPDATE_ACTIVE_EDITOR_TAB,
  UPDATE_ACTIVE_EDITOR_TAB_INDEX,
  UPDATE_BREAKPOINTSTEPS,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_CURRENTSTEP,
  UPDATE_EDITOR_BREAKPOINTS,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE,
  UPDATE_STEPSTOTAL,
  UPDATE_SUBLANGUAGE,
  UPDATE_SUBMISSIONS_TABLE_FILTERS,
  UPDATE_WORKSPACE,
  WorkspaceLocation,
  WorkspaceLocationsWithTools,
  WorkspaceState
} from './WorkspaceTypes';

export const setTokenCount = createAction(
  SET_TOKEN_COUNT,
  (workspaceLocation: WorkspaceLocation, tokenCount: number) => ({
    payload: { workspaceLocation, tokenCount }
  })
);

export const browseReplHistoryDown = createAction(
  BROWSE_REPL_HISTORY_DOWN,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const browseReplHistoryUp = createAction(
  BROWSE_REPL_HISTORY_UP,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const changeExternalLibrary = createAction(
  CHANGE_EXTERNAL_LIBRARY,
  (newExternal: ExternalLibraryName, workspaceLocation: WorkspaceLocation) => ({
    payload: { newExternal, workspaceLocation }
  })
);

export const changeExecTime = createAction(
  CHANGE_EXEC_TIME,
  (execTime: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { execTime, workspaceLocation }
  })
);

export const changeStepLimit = createAction(
  CHANGE_STEP_LIMIT,
  (stepLimit: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { stepLimit, workspaceLocation }
  })
);

export const chapterSelect = createAction(
  CHAPTER_SELECT,
  (chapter: Chapter, variant: Variant, workspaceLocation: WorkspaceLocation) => ({
    payload: { chapter, variant, workspaceLocation }
  })
);

export const externalLibrarySelect = createAction(
  PLAYGROUND_EXTERNAL_SELECT,
  (
    externalLibraryName: ExternalLibraryName,
    workspaceLocation: WorkspaceLocation,
    initialise?: boolean
  ) => ({
    payload: { externalLibraryName, workspaceLocation, initialise: initialise || false }
  })
);

export const toggleEditorAutorun = createAction(
  TOGGLE_EDITOR_AUTORUN,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

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
export const beginClearContext = createAction(
  BEGIN_CLEAR_CONTEXT,
  (workspaceLocation: WorkspaceLocation, library: Library, shouldInitLibrary: boolean) => ({
    payload: { library, workspaceLocation, shouldInitLibrary }
  })
);

export const clearReplInput = createAction(
  CLEAR_REPL_INPUT,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const clearReplOutput = createAction(
  CLEAR_REPL_OUTPUT,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const clearReplOutputLast = createAction(
  CLEAR_REPL_OUTPUT_LAST,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

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
export const endClearContext = createAction(
  END_CLEAR_CONTEXT,
  (library: Library, workspaceLocation: WorkspaceLocation) => ({
    payload: { library, workspaceLocation }
  })
);

export const evalEditor = createAction(EVAL_EDITOR, (workspaceLocation: WorkspaceLocation) => ({
  payload: { workspaceLocation }
}));

export const evalRepl = createAction(EVAL_REPL, (workspaceLocation: WorkspaceLocation) => ({
  payload: { workspaceLocation }
}));

export const evalTestcase = createAction(
  EVAL_TESTCASE,
  (workspaceLocation: WorkspaceLocation, testcaseId: number) => ({
    payload: { workspaceLocation, testcaseId }
  })
);

export const runAllTestcases = createAction(
  EVAL_EDITOR_AND_TESTCASES,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const toggleFolderMode = createAction(
  TOGGLE_FOLDER_MODE,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const enableTokenCounter = createAction(
  ENABLE_TOKEN_COUNTER,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const disableTokenCounter = createAction(
  DISABLE_TOKEN_COUNTER,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const setFolderMode = createAction(
  SET_FOLDER_MODE,
  (workspaceLocation: WorkspaceLocation, isFolderModeEnabled: boolean) => ({
    payload: { workspaceLocation, isFolderModeEnabled }
  })
);

export const updateActiveEditorTabIndex = createAction(
  UPDATE_ACTIVE_EDITOR_TAB_INDEX,
  (workspaceLocation: WorkspaceLocation, activeEditorTabIndex: number | null) => ({
    payload: { workspaceLocation, activeEditorTabIndex }
  })
);

export const updateActiveEditorTab = createAction(
  UPDATE_ACTIVE_EDITOR_TAB,
  (workspaceLocation: WorkspaceLocation, activeEditorTabOptions?: Partial<EditorTabState>) => ({
    payload: { workspaceLocation, activeEditorTabOptions }
  })
);

export const updateEditorValue = createAction(
  UPDATE_EDITOR_VALUE,
  (workspaceLocation: WorkspaceLocation, editorTabIndex: number, newEditorValue: string) => ({
    payload: { workspaceLocation, editorTabIndex, newEditorValue }
  })
);

export const setEditorBreakpoint = createAction(
  UPDATE_EDITOR_BREAKPOINTS,
  (workspaceLocation: WorkspaceLocation, editorTabIndex: number, newBreakpoints: string[]) => ({
    payload: { workspaceLocation, editorTabIndex, newBreakpoints }
  })
);

export const setEditorHighlightedLines = createAction(
  UPDATE_EDITOR_HIGHLIGHTED_LINES,
  (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ payload: { workspaceLocation, editorTabIndex, newHighlightedLines } })
);

export const setEditorHighlightedLinesControl = createAction(
  UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL,
  (
    workspaceLocation: WorkspaceLocation,
    editorTabIndex: number,
    newHighlightedLines: HighlightedLines[]
  ) => ({ payload: { workspaceLocation, editorTabIndex, newHighlightedLines } })
);

export const moveCursor = createAction(
  MOVE_CURSOR,
  (workspaceLocation: WorkspaceLocation, editorTabIndex: number, newCursorPosition: Position) => ({
    payload: { workspaceLocation, editorTabIndex, newCursorPosition }
  })
);

export const addEditorTab = createAction(
  ADD_EDITOR_TAB,
  (workspaceLocation: WorkspaceLocation, filePath: string, editorValue: string) => ({
    payload: { workspaceLocation, filePath, editorValue }
  })
);

export const shiftEditorTab = createAction(
  SHIFT_EDITOR_TAB,
  (
    workspaceLocation: WorkspaceLocation,
    previousEditorTabIndex: number,
    newEditorTabIndex: number
  ) => ({ payload: { workspaceLocation, previousEditorTabIndex, newEditorTabIndex } })
);

export const removeEditorTab = createAction(
  REMOVE_EDITOR_TAB,
  (workspaceLocation: WorkspaceLocation, editorTabIndex: number) => ({
    payload: { workspaceLocation, editorTabIndex }
  })
);

export const removeEditorTabForFile = createAction(
  REMOVE_EDITOR_TAB_FOR_FILE,
  (workspaceLocation: WorkspaceLocation, removedFilePath: string) => ({
    payload: { workspaceLocation, removedFilePath }
  })
);

export const removeEditorTabsForDirectory = createAction(
  REMOVE_EDITOR_TABS_FOR_DIRECTORY,
  (workspaceLocation: WorkspaceLocation, removedDirectoryPath: string) => ({
    payload: { workspaceLocation, removedDirectoryPath }
  })
);

export const renameEditorTabForFile = createAction(
  RENAME_EDITOR_TAB_FOR_FILE,
  (workspaceLocation: WorkspaceLocation, oldFilePath: string, newFilePath: string) => ({
    payload: { workspaceLocation, oldFilePath, newFilePath }
  })
);

export const renameEditorTabsForDirectory = createAction(
  RENAME_EDITOR_TABS_FOR_DIRECTORY,
  (workspaceLocation: WorkspaceLocation, oldDirectoryPath: string, newDirectoryPath: string) => ({
    payload: { workspaceLocation, oldDirectoryPath, newDirectoryPath }
  })
);

export const updateReplValue = createAction(
  UPDATE_REPL_VALUE,
  (newReplValue: string, workspaceLocation: WorkspaceLocation) => ({
    payload: { newReplValue, workspaceLocation }
  })
);

export const sendReplInputToOutput = createAction(
  SEND_REPL_INPUT_TO_OUTPUT,
  (newOutput: string, workspaceLocation: WorkspaceLocation) => ({
    payload: { type: 'code', workspaceLocation, value: newOutput }
  })
);

export const resetTestcase = createAction(
  RESET_TESTCASE,
  (workspaceLocation: WorkspaceLocation, index: number) => ({
    payload: { workspaceLocation, index }
  })
);

export const navigateToDeclaration = createAction(
  NAV_DECLARATION,
  (workspaceLocation: WorkspaceLocation, cursorPosition: Position) => ({
    payload: { workspaceLocation, cursorPosition }
  })
);

/**
 * Resets a workspace to its default properties.
 *
 * @param workspaceLocation the workspace to be reset
 * @param workspaceOptions an object with any number of properties
 *   in IWorkspaceState, that will take precedence over the default
 *   values. For example, one can use this to specify a particular
 *   editorValue.
 */
export const resetWorkspace = createAction(
  RESET_WORKSPACE,
  (workspaceLocation: WorkspaceLocation, workspaceOptions?: Partial<WorkspaceState>) => ({
    payload: { workspaceLocation, workspaceOptions }
  })
);

export const updateWorkspace = createAction(
  UPDATE_WORKSPACE,
  (workspaceLocation: WorkspaceLocation, workspaceOptions?: Partial<WorkspaceState>) => ({
    payload: { workspaceLocation, workspaceOptions }
  })
);

export const setIsEditorReadonly = createAction(
  SET_IS_EDITOR_READONLY,
  (workspaceLocation: WorkspaceLocation, isEditorReadonly: boolean) => ({
    payload: { workspaceLocation, isEditorReadonly }
  })
);

export const updateSubmissionsTableFilters = createAction(
  UPDATE_SUBMISSIONS_TABLE_FILTERS,
  (filters: SubmissionsTableFilters) => ({ payload: { filters } })
);

export const updateCurrentAssessmentId = createAction(
  UPDATE_CURRENT_ASSESSMENT_ID,
  (assessmentId: number, questionId: number) => ({ payload: { assessmentId, questionId } })
);

export const updateCurrentSubmissionId = createAction(
  UPDATE_CURRENT_SUBMISSION_ID,
  (submissionId: number, questionId: number) => ({ payload: { submissionId, questionId } })
);

export const updateHasUnsavedChanges = createAction(
  UPDATE_HAS_UNSAVED_CHANGES,
  (workspaceLocation: WorkspaceLocation, hasUnsavedChanges: boolean) => ({
    payload: { workspaceLocation, hasUnsavedChanges }
  })
);

export const changeSublanguage = createAction(CHANGE_SUBLANGUAGE, (sublang: SALanguage) => ({
  payload: { sublang }
}));

export const updateSublanguage = createAction(UPDATE_SUBLANGUAGE, (sublang: SALanguage) => ({
  payload: { sublang }
}));

export const promptAutocomplete = createAction(
  PROMPT_AUTOCOMPLETE,
  (
    workspaceLocation: WorkspaceLocation,
    row: number,
    column: number,
    callback: any // TODO: define a type for this
  ) => ({ payload: { workspaceLocation, row, column, callback } })
);

export const notifyProgramEvaluated = createAction(
  NOTIFY_PROGRAM_EVALUATED,
  (
    result: any,
    lastDebuggerResult: any,
    code: string,
    context: Context,
    workspaceLocation?: WorkspaceLocation
  ) => ({ payload: { result, lastDebuggerResult, code, context, workspaceLocation } })
);

export const toggleUsingSubst = createAction(
  TOGGLE_USING_SUBST,
  (usingSubst: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    payload: { usingSubst, workspaceLocation }
  })
);

export const addHtmlConsoleError = createAction(
  ADD_HTML_CONSOLE_ERROR,
  (errorMsg: string, workspaceLocation: WorkspaceLocation, storyEnv?: string) => ({
    payload: { errorMsg, workspaceLocation, storyEnv }
  })
);

export const toggleUsingCse = createAction(
  TOGGLE_USING_CSE,
  (usingCse: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    payload: { usingCse, workspaceLocation }
  })
);

export const toggleUpdateCse = createAction(
  TOGGLE_UPDATE_CSE,
  (updateCse: boolean, workspaceLocation: WorkspaceLocationsWithTools) => ({
    payload: { updateCse, workspaceLocation }
  })
);

export const updateCurrentStep = createAction(
  UPDATE_CURRENTSTEP,
  (steps: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { steps, workspaceLocation }
  })
);

export const updateStepsTotal = createAction(
  UPDATE_STEPSTOTAL,
  (steps: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { steps, workspaceLocation }
  })
);

export const updateBreakpointSteps = createAction(
  UPDATE_BREAKPOINTSTEPS,
  (breakpointSteps: number[], workspaceLocation: WorkspaceLocation) => ({
    payload: { breakpointSteps, workspaceLocation }
  })
);
