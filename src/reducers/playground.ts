import { Reducer } from 'redux'
import {
  EVAL_INTERPRETER_SUCCESS,
  ILoadedAction,
  UPDATE_EDITOR_VALUE
} from '../actions/actionTypes'
import { Context, createContext } from '../slang'

export type CodeOutput = {
  type: 'code'
  value: string
}

export type ResultOutput = {
  type: 'result'
  value: any
  runtime?: number
  isProgram?: boolean
}

export type ErrorOutput = {
  type: 'errors'
  errors: any[]
}

export type LogOutput = {
  type: 'log'
  value: string
}

export type InterpreterOutput = CodeOutput | ResultOutput | ErrorOutput | LogOutput

export interface IPlaygroundState {
  editorValue: string
  context: Context
  output: InterpreterOutput[]
}

/**
 * The default (initial) state of the `IPlaygroundState`
 */
export const defaultState: IPlaygroundState = {
  editorValue: '',
  context: createContext(),
  output: [{ type: 'result', value: 'Default output text' }]
}

/**
 * The reducer for `IPlaygroundState`
 *
 * UPDATE_EDITOR_VALUE: Update the `editorValue` property
 */
export const reducer: Reducer<IPlaygroundState> = (state = defaultState, action: ILoadedAction) => {
  switch (action.type) {
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        editorValue: action.payload
      }
    case EVAL_INTERPRETER_SUCCESS:
      const outputClone = state.output.slice(0)
      outputClone.push(action.payload as InterpreterOutput)
      return {
        ...state,
        output: outputClone
      }
    default:
      return state
  }
}
