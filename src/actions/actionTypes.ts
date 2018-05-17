import { Action } from 'redux'

export interface ILoadedAction extends Action {
  payload: any
}

/** Playground */
export const UPDATE_EDITOR_VALUE: string = 'UPDATE_EDITOR_VALUE'
export const EVAL_EDITOR = 'EVAL_EDITOR'

/** Interpreter */
export const EVAL_INTERPRETER = 'EVAL_INTERPRETER'
export const EVAL_INTERPRETER_SUCCESS = 'EVAL_INTERPRETER_SUCCESS'
export const EVAL_INTERPRETER_ERROR = 'EVAL_INTERPRETER_ERROR'
export const INTERRUPT_EXECUTION: string = 'INTERRUPT_EXECUTION'
