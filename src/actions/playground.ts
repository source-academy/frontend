import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const changeActiveTab: ActionCreator<actionTypes.IAction> = (activeTab: number) => ({
  type: actionTypes.CHANGE_ACTIVE_TAB,
  payload: activeTab
})

export const updateEditorValue: ActionCreator<actionTypes.IAction> = (newEditorValue: string) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: newEditorValue
})

export const changeEditorWidth: ActionCreator<actionTypes.IAction> = (widthChange: string) => ({
  type: actionTypes.CHANGE_EDITOR_WIDTH,
  payload: widthChange
})

export const changeSideContentHeight: ActionCreator<actionTypes.IAction> = (height: number) => ({
  type: actionTypes.CHANGE_SIDE_CONTENT_HEIGHT,
  payload: height
})

export const updateReplValue: ActionCreator<actionTypes.IAction> = (newReplValue: string) => ({
  type: actionTypes.UPDATE_REPL_VALUE,
  payload: newReplValue
})

export const sendReplInputToOutput: ActionCreator<actionTypes.IAction> = (newOutput: string) => ({
  type: actionTypes.SEND_REPL_INPUT_TO_OUTPUT,
  payload: {
    type: 'code',
    value: newOutput
  }
})

export const chapterSelect: ActionCreator<actionTypes.IAction> = (chapter, changeEvent) => ({
  type: actionTypes.CHAPTER_SELECT,
  payload: chapter.chapter
})

export const changeChapter: ActionCreator<actionTypes.IAction> = (newChapter: number) => ({
  type: actionTypes.CHANGE_CHAPTER,
  payload: newChapter
})

export const evalEditor = () => ({
  type: actionTypes.EVAL_EDITOR
})

export const evalRepl = () => ({
  type: actionTypes.EVAL_REPL
})

export const clearReplInput = () => ({
  type: actionTypes.CLEAR_REPL_INPUT
})

export const clearReplOutput = () => ({
  type: actionTypes.CLEAR_REPL_OUTPUT
})

export const clearContext = () => ({
  type: actionTypes.CLEAR_CONTEXT
})
