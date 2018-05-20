import { Action as ReduxAction } from 'redux'

export interface IAction extends ReduxAction {
  payload: any
}

/** Playground */
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE'
export const UPDATE_REPL_VALUE = 'UPDATE_REPL_VALUE'
export const EVAL_EDITOR = 'EVAL_EDITOR'
export const EVAL_REPL = 'EVAL_REPL'
export const CLEAR_REPL_INPUT = 'CLEAR_REPL_INPUT'
export const CLEAR_REPL_OUTPUT = 'CLEAR_REPL_OUTPUT'
export const CLEAR_CONTEXT = 'CLEAR_CONTEXT'

/** Interpreter */
export const EVAL_INTERPRETER = 'EVAL_INTERPRETER'
export const EVAL_INTERPRETER_SUCCESS = 'EVAL_INTERPRETER_SUCCESS'
export const EVAL_INTERPRETER_ERROR = 'EVAL_INTERPRETER_ERROR'
export const INTERRUPT_EXECUTION = 'INTERRUPT_EXECUTION'
