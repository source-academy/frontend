/* tslint:disable: ban-types*/
import { createContext as createSlangContext } from 'js-slang'
import { toString } from 'js-slang/dist/interop'
import { Value } from 'js-slang/dist/types'

import { handleConsoleLog } from '../actions'

/**
 * This file contains wrappers for certain functions
 * in the @source-academy/slang module.
 *
 * Use this file especially when attempting to create a slang Context.
 */

/**
 * Used to permit the declaration of the
 * __SOURCE__ property. The same declaration
 * exists in js-slang.
 */
declare global {
  // tslint:disable-next-line:interface-name
  interface Function {
    __SOURCE__?: string
  }
}

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
  return prompt(toString(value))
}
cadetPrompt.__SOURCE__ = 'prompt(a)'

/**
 * A function to alert the user using the browser's alert()
 * function.
 *
 * @param value the value to alert the user with
 */
function cadetAlert(value: any) {
  alert(toString(value))
}
cadetAlert.__SOURCE__ = 'alert(a)'

/**
 * A dummy function to pass into createContext.
 * An actual implementation will have to be added
 * with the list visualiser implementation. See #187
 *
 * @param list the list to be visualised.
 */
function visualiseList(list: any) {
  if ((window as any).ListVisualizer) {
    ;(window as any).ListVisualizer.draw(list)
  } else {
    throw new Error('List visualizer is not enabled')
  }
}
/** Follow the js-slang specification of the visualiseList symbol. */
visualiseList.__SOURCE__ = 'draw(a)'

/**
 * A wrapper around js-slang's createContext. This
 * provides the original function with the required
 * externalBuiltIns, such as display and prompt.
 */
export function createContext<T>(chapter = 1, externals: string[] = [], externalContext: T) {
  const externalBuiltIns = {
    display,
    prompt: cadetPrompt,
    alert: cadetAlert,
    visualiseList
  }
  return createSlangContext<T>(chapter, externals, externalContext, externalBuiltIns)
}
