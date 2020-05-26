import { action } from 'typesafe-actions';

import { Variant } from 'js-slang/dist/types';

import { IWorkspaceState } from 'src/commons/application/ApplicationTypes';
import * as actionTypes from 'src/commons/application/types/ActionTypes';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes'; 
import { Library } from 'src/commons/assessment/AssessmentTypes';
import { Position } from 'src/commons/editor/EditorComponent';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';

import { WorkspaceLocation } from './WorkspaceTypes';

export const browseReplHistoryDown = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.BROWSE_REPL_HISTORY_DOWN, { workspaceLocation });

export const browseReplHistoryUp = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.BROWSE_REPL_HISTORY_UP, { workspaceLocation });

export const changeExternalLibrary = (newExternal: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CHANGE_EXTERNAL_LIBRARY, { newExternal, workspaceLocation });

export const changeEditorHeight = (height: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CHANGE_EDITOR_HEIGHT, { height, workspaceLocation });

export const changeEditorWidth = (widthChange: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CHANGE_EDITOR_WIDTH, { widthChange, workspaceLocation });

export const changeExecTime = (execTime: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CHANGE_EXEC_TIME, { execTime, workspaceLocation });

export const changeSideContentHeight = (height: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CHANGE_SIDE_CONTENT_HEIGHT, { height, workspaceLocation });

export const chapterSelect = (
  chapter: number,
  variant: Variant,
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.CHAPTER_SELECT, {
    chapter,
    variant,
    workspaceLocation
  });

export const externalLibrarySelect = (
  externalLibraryName: ExternalLibraryName,
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.PLAYGROUND_EXTERNAL_SELECT, {
    externalLibraryName,
    workspaceLocation
  });

export const toggleEditorAutorun = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TOGGLE_EDITOR_AUTORUN, { workspaceLocation });

export const updateActiveTab = (activeTab: SideContentType, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.UPDATE_ACTIVE_TAB, { activeTab, workspaceLocation });

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
export const beginClearContext = (library: Library, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.BEGIN_CLEAR_CONTEXT, {
    library,
    workspaceLocation
  });

export const clearReplInput = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CLEAR_REPL_INPUT, { workspaceLocation });

export const clearReplOutput = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CLEAR_REPL_OUTPUT, { workspaceLocation });

export const clearReplOutputLast = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.CLEAR_REPL_OUTPUT_LAST, { workspaceLocation });

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
  action(actionTypes.END_CLEAR_CONTEXT, {
    library,
    workspaceLocation
  });

export const ensureLibrariesLoaded = () => action(actionTypes.ENSURE_LIBRARIES_LOADED);

export const evalEditor = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.EVAL_EDITOR, { workspaceLocation });

export const evalRepl = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.EVAL_REPL, { workspaceLocation });

export const evalTestcase = (workspaceLocation: WorkspaceLocation, testcaseId: number) =>
  action(actionTypes.EVAL_TESTCASE, { workspaceLocation, testcaseId });

export const updateEditorValue = (newEditorValue: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.UPDATE_EDITOR_VALUE, { newEditorValue, workspaceLocation });

export const setEditorBreakpoint = (breakpoints: string[], workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.UPDATE_EDITOR_BREAKPOINTS, { breakpoints, workspaceLocation });

export const highlightEditorLine = (
  highlightedLines: number[],
  workspaceLocation: WorkspaceLocation
) => action(actionTypes.HIGHLIGHT_LINE, { highlightedLines, workspaceLocation });

export const updateReplValue = (newReplValue: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.UPDATE_REPL_VALUE, { newReplValue, workspaceLocation });

export const sendReplInputToOutput = (newOutput: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.SEND_REPL_INPUT_TO_OUTPUT, {
    type: 'code',
    workspaceLocation,
    value: newOutput
  });

export const resetTestcase = (workspaceLocation: WorkspaceLocation, index: number) =>
  action(actionTypes.RESET_TESTCASE, { workspaceLocation, index });

export const navigateToDeclaration = (
  workspaceLocation: WorkspaceLocation,
  cursorPosition: Position
) => action(actionTypes.NAV_DECLARATION, { workspaceLocation, cursorPosition });

export const moveCursor = (workspaceLocation: WorkspaceLocation, cursorPosition: Position) =>
  action(actionTypes.MOVE_CURSOR, { workspaceLocation, cursorPosition });

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
  workspaceOptions?: Partial<IWorkspaceState>
) =>
  action(actionTypes.RESET_WORKSPACE, {
    workspaceLocation,
    workspaceOptions
  });

export const updateWorkspace = (
  workspaceLocation: WorkspaceLocation,
  workspaceOptions?: Partial<IWorkspaceState>
) =>
  action(actionTypes.UPDATE_WORKSPACE, {
    workspaceLocation,
    workspaceOptions
  });

export const setEditorReadonly = (workspaceLocation: WorkspaceLocation, editorReadonly: boolean) =>
  action(actionTypes.SET_EDITOR_READONLY, {
    workspaceLocation,
    editorReadonly
  });

export const updateCurrentAssessmentId = (assessmentId: number, questionId: number) =>
  action(actionTypes.UPDATE_CURRENT_ASSESSMENT_ID, {
    assessmentId,
    questionId
  });

export const updateCurrentSubmissionId = (submissionId: number, questionId: number) =>
  action(actionTypes.UPDATE_CURRENT_SUBMISSION_ID, {
    submissionId,
    questionId
  });

export const updateHasUnsavedChanges = (
  workspaceLocation: WorkspaceLocation,
  hasUnsavedChanges: boolean
) =>
  action(actionTypes.UPDATE_HAS_UNSAVED_CHANGES, {
    workspaceLocation,
    hasUnsavedChanges
  });

export const fetchChapter = () => action(actionTypes.FETCH_CHAPTER);

export const changeChapter = (chapter: number, variant: Variant) =>
  action(actionTypes.CHANGE_CHAPTER, { chapter, variant });

export const updateChapter = (chapter: number, variant: Variant) =>
  action(actionTypes.UPDATE_CHAPTER, { chapter, variant });

export const promptAutocomplete = (
  workspaceLocation: WorkspaceLocation,
  row: number,
  column: number,
  callback: any // TODO: define a type for this
) =>
  action(actionTypes.PROMPT_AUTOCOMPLETE, {
    workspaceLocation,
    row,
    column,
    callback
  });
