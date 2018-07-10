/* tslint:disable: ban-types*/
import { createContext as createSlangContext } from '@source-academy/js-slang'
import { toString } from '@source-academy/js-slang/dist/interop'
import { Context, Value } from '@source-academy/js-slang/dist/types'

import { handleConsoleLog } from '../actions'

/**
 * This file contains wrappers for certain functions 
 * in the @source-academy/slang module.
 *
 * Use this file especially when attempting to create a slang Context.
 */


/**
 * Function that takes a value and displays it in the interpreter. 
 * An action is dispatched using the redux store reference 
 * within the global window object.
 *
 * @param value the value to be displayed
 * @param workspaceLocation used to determine 
 *   which REPL the value shows up in.
 */
function display(value: Value, workspaceLocation: any) {
  const output = toString(value)
  // TODO in 2019: fix this hack
  if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
    ;(window as any).__REDUX_STORE__.dispatch(handleConsoleLog(output, workspaceLocation))
  }
}
display.__SOURCE__ = 'display(a)'

/**
 * A function to prompt the user using a popup.
 * The function is not called 'prompt' to prevent shadowing.
 *
 * @param value the value to be displayed as a prompt
 */
function cadetPrompt(value: any) {
  return prompt(toString(value));
}
cadetPrompt.__SOURCE__ = 'prompt(a)'

/**
 * A wrapper around js-slang's createContext. This 
 * provides the original function with the required 
 * externalBuiltIns, such as display and prompt.
 */
export function createContext<T>(chapter = 1, externals = [], externalContext?: T) {
  const externalBuiltIns = {
    display,
    prompt: cadetPrompt
  }
  return createSlangContext<T>(chapter, externals, 
    externalContext, externalBuiltIns)
}
