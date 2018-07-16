import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

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
  playground = 'playground'
}
export type WorkspaceLocation = keyof typeof WorkspaceLocations

export const changeActiveTab: ActionCreator<actionTypes.IAction> = (
  activeTab: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_ACTIVE_TAB,
  payload: { activeTab, workspaceLocation }
})

export const changePlaygroundExternal: ActionCreator<actionTypes.IAction> = (
  newExternal: string,
) => ({
  type: actionTypes.CHANGE_PLAYGROUND_EXTERNAL,
  payload: { newExternal }
})

export const changeEditorWidth: ActionCreator<actionTypes.IAction> = (
  widthChange: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_EDITOR_WIDTH,
  payload: { widthChange, workspaceLocation }
})

export const changeSideContentHeight: ActionCreator<actionTypes.IAction> = (
  height: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_SIDE_CONTENT_HEIGHT,
  payload: { height, workspaceLocation }
})

export const chapterSelect: ActionCreator<actionTypes.IAction> = (
  chapter,
  changeEvent,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHAPTER_SELECT,
  payload: {
    chapter: chapter.chapter,
    workspaceLocation
  }
})

export const playgroundExternalSelect: ActionCreator<actionTypes.IAction> = (
  external,
  changeEvent,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.PLAYGROUND_EXTERNAL_SELECT,
  payload: {
    external: external.displayName,
    workspaceLocation
  }
})

export const clearContext = (
  chapter: number,
  externals: string[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CLEAR_CONTEXT,
  payload: {
    workspaceLocation,
    chapter,
    externals
  }
})

export const clearReplInput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_INPUT,
  payload: { workspaceLocation }
})

export const clearReplOutput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_OUTPUT,
  payload: { workspaceLocation }
})

export const evalEditor = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_EDITOR,
  payload: { workspaceLocation }
})

export const evalRepl = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_REPL,
  payload: { workspaceLocation }
})

export const updateEditorValue: ActionCreator<actionTypes.IAction> = (
  newEditorValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: { newEditorValue, workspaceLocation }
})

export const updateReplValue: ActionCreator<actionTypes.IAction> = (
  newReplValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_REPL_VALUE,
  payload: { newReplValue, workspaceLocation }
})

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
})

export const resetAssessmentWorkspace = () => ({
  type: actionTypes.RESET_ASSESSMENT_WORKSPACE
})

export const updateCurrentAssessmentId = (assessmentId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_ASSESSMENT_ID,
  payload: {
    assessmentId,
    questionId
  }
})

export const updateCurrentSubmissionId = (submissionId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_SUBMISSION_ID,
  payload: {
    submissionId,
    questionId
  }
})

export const updateGradingCommentsValue: ActionCreator<actionTypes.IAction> = (
  newComments: string
) => ({
  type: actionTypes.UPDATE_GRADING_COMMENTS_VALUE,
  payload: newComments
})

export const updateGradingXP: ActionCreator<actionTypes.IAction> = (newXP: number) => ({
  type: actionTypes.UPDATE_GRADING_XP,
  payload: newXP
})

export const saveGradingInput: ActionCreator<actionTypes.IAction> = (
  gradingCommentsValue: string,
  gradingXP: number | undefined
) => ({
  type: actionTypes.SAVE_GRADING_INPUT,
  payload: {
    gradingCommentsValue,
    gradingXP
  }
})
