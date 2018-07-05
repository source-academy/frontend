import { Action as ReduxAction } from 'redux'

export interface IAction extends ReduxAction {
  payload: any
}

/** Academy */
export const SAVE_CANVAS = 'SAVE_CANVAS'

/** Playground */
export const CHANGE_QUERY_STRING = 'CHANGE_QUERY_STRING'
export const GENERATE_LZ_STRING = 'GENERATE_LZ_STRING'

/** Interpreter */
export const HANDLE_CONSOLE_LOG = 'HANDLE_CONSOLE_LOG'
export const EVAL_INTERPRETER_SUCCESS = 'EVAL_INTERPRETER_SUCCESS'
export const EVAL_INTERPRETER_ERROR = 'EVAL_INTERPRETER_ERROR'
export const INTERRUPT_EXECUTION = 'INTERRUPT_EXECUTION'

/** Workspace */
export const CHANGE_ACTIVE_TAB = 'CHANGE_ACTIVE_TAB'
export const CHANGE_CHAPTER = 'CHANGE_CHAPTER'
export const CHANGE_EDITOR_WIDTH = 'CHANGE_EDITOR_WIDTH'
export const CHANGE_SIDE_CONTENT_HEIGHT = 'CHANGE_SIDE_CONTENT_HEIGHT'
export const CHAPTER_SELECT = 'CHAPTER_SELECT'
export const CLEAR_REPL_INPUT = 'CLEAR_REPL_INPUT'
export const CLEAR_REPL_OUTPUT = 'CLEAR_REPL_OUTPUT'
export const CLEAR_CONTEXT = 'CLEAR_CONTEXT'
export const EVAL_EDITOR = 'EVAL_EDITOR'
export const EVAL_REPL = 'EVAL_REPL'
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE'
export const UPDATE_REPL_VALUE = 'UPDATE_REPL_VALUE'
export const SEND_REPL_INPUT_TO_OUTPUT = 'SEND_REPL_INPUT_TO_OUTPUT'
export const RESET_ASSESSMENT_WORKSPACE = 'RESET_ASSESSMENT_WORKSPACE'
export const UPDATE_CURRENT_ASSESSMENT_ID = 'UPDATE_CURRENT_ASSESSMENT_ID'
export const UPDATE_CURRENT_SUBMISSION_ID = 'UPDATE_CURRENT_SUBMISSION_ID'
export const UPDATE_GRADING_COMMENTS_VALUE = 'UPDATE_GRADING_COMMENTS_VALUE'
export const UPDATE_GRADING_XP = 'UPDATE_GRADING_XP'

/** Session */
export const FETCH_ANNOUNCEMENTS = 'FETCH_ANNOUNCEMENTS'
export const FETCH_AUTH = 'FETCH_AUTH'
export const FETCH_ASSESSMENT = 'FETCH_ASSESSMENT'
export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS'
export const FETCH_GRADING = 'FETCH_GRADING'
export const FETCH_GRADING_OVERVIEWS = 'FETCH_GRADING_OVERVIEWS'
export const LOGIN = 'LOGIN'
export const SET_TOKENS = 'SET_TOKENS'
export const SET_USERNAME = 'SET_USERNAME'
export const UPDATE_HISTORY_HELPERS = 'UPDATE_HISTORY_HELPERS'
export const UPDATE_ASSESSMENT_OVERVIEWS = 'UPDATE_ASSESSMENT_OVERVIEWS'
export const UPDATE_ASSESSMENT = 'UPDATE_ASSESSMENT'
export const UPDATE_GRADING_OVERVIEWS = 'UPDATE_GRADING_OVERVIEWS'
export const UPDATE_GRADING = 'UPDATE_GRADING'
