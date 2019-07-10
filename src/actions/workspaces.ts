import { ActionCreator } from 'redux';

import { ExternalLibraryName, Library } from '../components/assessment/assessmentShape';
import { IWorkspaceState } from '../reducers/states';
import * as actionTypes from './actionTypes';

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
  grading = 'grading'
}

export type WorkspaceLocation = keyof typeof WorkspaceLocations;

export const browseReplHistoryDown: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.BROWSE_REPL_HISTORY_DOWN,
  payload: { workspaceLocation }
});

export const browseReplHistoryUp: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.BROWSE_REPL_HISTORY_UP,
  payload: { workspaceLocation }
});

export const changeActiveTab: ActionCreator<actionTypes.IAction> = (
  activeTab: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_ACTIVE_TAB,
  payload: { activeTab, workspaceLocation }
});

export const changePlaygroundExternal: ActionCreator<actionTypes.IAction> = (
  newExternal: string
) => ({
  type: actionTypes.CHANGE_PLAYGROUND_EXTERNAL,
  payload: { newExternal }
});

export const changeEditorHeight: ActionCreator<actionTypes.IAction> = (
  height: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_EDITOR_HEIGHT,
  payload: { height, workspaceLocation }
});

export const changeEditorWidth: ActionCreator<actionTypes.IAction> = (
  widthChange: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_EDITOR_WIDTH,
  payload: { widthChange, workspaceLocation }
});

export const changeSideContentHeight: ActionCreator<actionTypes.IAction> = (
  height: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_SIDE_CONTENT_HEIGHT,
  payload: { height, workspaceLocation }
});

export const chapterSelect: ActionCreator<actionTypes.IAction> = (
  chapter: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHAPTER_SELECT,
  payload: {
    chapter,
    workspaceLocation
  }
});

export const playgroundExternalSelect: ActionCreator<actionTypes.IAction> = (
  externalLibraryName: ExternalLibraryName,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.PLAYGROUND_EXTERNAL_SELECT,
  payload: {
    externalLibraryName,
    workspaceLocation
  }
});

export const toggleEditorAutorun: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.TOGGLE_EDITOR_AUTORUN,
  payload: { workspaceLocation }
});

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
export const beginClearContext = (library: Library, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.BEGIN_CLEAR_CONTEXT,
  payload: {
    library,
    workspaceLocation
  }
});

export const clearReplInput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_INPUT,
  payload: { workspaceLocation }
});

export const clearReplOutput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_OUTPUT,
  payload: { workspaceLocation }
});

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
export const endClearContext = (library: Library, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.END_CLEAR_CONTEXT,
  payload: {
    library,
    workspaceLocation
  }
});

export const ensureLibrariesLoaded = () => ({
  type: actionTypes.ENSURE_LIBRARIES_LOADED
});

export const evalEditor = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_EDITOR,
  payload: { workspaceLocation }
});

export const evalRepl = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_REPL,
  payload: { workspaceLocation }
});

export const evalTestcase = (workspaceLocation: WorkspaceLocation, testcaseId: number) => ({
  type: actionTypes.EVAL_TESTCASE,
  payload: { workspaceLocation, testcaseId }
});

export const invalidEditorSessionId = () => ({
  type: actionTypes.INVALID_EDITOR_SESSION_ID
});

export const updateEditorValue: ActionCreator<actionTypes.IAction> = (
  newEditorValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: { newEditorValue, workspaceLocation }
});

export const setEditorBreakpoint: ActionCreator<actionTypes.IAction> = (
  breakpoints: string[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_EDITOR_BREAKPOINTS,
  payload: { breakpoints, workspaceLocation }
});

export const highlightEditorLine: ActionCreator<actionTypes.IAction> = (
  highlightedLines: number[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.HIGHLIGHT_LINE,
  payload: { highlightedLines, workspaceLocation }
});

export const updateReplValue: ActionCreator<actionTypes.IAction> = (
  newReplValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_REPL_VALUE,
  payload: { newReplValue, workspaceLocation }
});

export const sendReplInputToOutput: ActionCreator<actionTypes.IAction> = (
  newOutput: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SEND_REPL_INPUT_TO_OUTPUT,
  payload: {
    type: 'code',
    workspaceLocation,
    value: newOutput
  }
});

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
) => ({
  type: actionTypes.RESET_WORKSPACE,
  payload: {
    workspaceLocation,
    workspaceOptions
  }
});

export const updateWorkspace = (
  workspaceLocation: WorkspaceLocation,
  workspaceOptions?: Partial<IWorkspaceState>
) => ({
  type: actionTypes.UPDATE_WORKSPACE,
  payload: {
    workspaceLocation,
    workspaceOptions
  }
});

export const setEditorSessionId: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation,
  editorSessionId: string
) => ({
  type: actionTypes.SET_EDITOR_SESSION_ID,
  payload: {
    workspaceLocation,
    editorSessionId
  }
});

/**
 * Sets sharedb websocket status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param websocketStatus 0: CLOSED 1: OPEN
 */
export const setWebsocketStatus: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocations,
  websocketStatus: number
) => ({
  type: actionTypes.SET_WEBSOCKET_STATUS,
  payload: {
    workspaceLocation,
    websocketStatus
  }
});

export const updateCurrentAssessmentId = (assessmentId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_ASSESSMENT_ID,
  payload: {
    assessmentId,
    questionId
  }
});

export const updateCurrentSubmissionId = (submissionId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_SUBMISSION_ID,
  payload: {
    submissionId,
    questionId
  }
});

export const updateHasUnsavedChanges: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation,
  hasUnsavedChanges: boolean
) => ({
  type: actionTypes.UPDATE_HAS_UNSAVED_CHANGES,
  payload: {
    workspaceLocation,
    hasUnsavedChanges
  }
});
