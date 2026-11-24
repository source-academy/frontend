import createSlangContext from 'js-slang/dist/createContext';
import { type Chapter, type LanguageOptions, Variant } from 'js-slang/dist/langs';
import { type Context, type Value } from 'js-slang/dist/types';
import { stringify } from 'js-slang/dist/utils/stringify';
import CseMachine from 'src/features/cseMachine/CseMachine';

import DataVisualizer from '../../features/dataVisualizer/dataVisualizer';
import type { Data } from '../../features/dataVisualizer/dataVisualizerTypes';
import DisplayBufferService from './DisplayBufferService';

/**
 * This file contains wrappers for certain functions
 * in the @source-academy/slang module.
 *
 * Use this file especially when attempting to create a slang Context.
 */

/**
 * Function that takes a value and displays it in the interpreter.
 * It uses the js-slang stringify to convert values into a "nicer"
 * output. e.g. [1, 2, 3] displays as [1, 2, 3].
 * An action is dispatched using the redux store reference
 * within the global window object.
 *
 * @param value the value to be displayed
 * @param workspaceLocation used to determine
 *   which REPL the value shows up in.
 */
function display(value: Value, str: string, workspaceLocation: any) {
  display((str === undefined ? '' : str + ' ') + stringify(value), '', workspaceLocation);
  return value;
}

/**
 * Function that takes a value and displays it in the interpreter.
 * The value is displayed however full JS would convert it to a string.
 * e.g. [1, 2, 3] would be displayed as 1,2,3.
 * An action is dispatched using the redux store reference
 * within the global window object.
 *
 * @param value the value to be displayed
 * @param workspaceLocation used to determine
 *   which REPL the value shows up in.
 */
function rawDisplay(value: Value, str: string, workspaceLocation: any) {
  const output = (str === undefined ? '' : str + ' ') + String(value);
  DisplayBufferService.push(output, workspaceLocation);

  return value;
}

/**
 * A function to prompt the user using a popup.
 * The function is not called 'prompt' to prevent shadowing.
 *
 * @param value the value to be displayed as a prompt
 */
function cadetPrompt(value: any) {
  return prompt(value);
}

/**
 * A function to alert the user using the browser's alert()
 * function.
 *
 * @param value the value to alert the user with
 */
function cadetAlert(value: any) {
  alert(stringify(value));
}

/**
 * A dummy function to pass into createContext.
 * An actual implementation will have to be added
 * with the data visualizer implementation. See #187
 *
 * @param args the data to be visualized.
 */
function visualizeData(...args: Data[]) {
  try {
    // Pass in args[0] since args is in the form; [(Array of drawables), "playground"]
    DataVisualizer.drawData(args[0]);

    // If there is only one arg, just print out the first arg in REPL, instead of [first arg]
    return args[0].length === 1 ? args[0][0] : args[0];
  } catch (err) {
    console.log(err);
    throw new Error('Data visualizer is not enabled');
  }
}

export function visualizeCseMachine({ context }: { context: Context }) {
  try {
    CseMachine.drawCse(context);
  } catch (err) {
    // Saga/unit tests may execute without mounting the CSE side content, so this
    // initialization error is expected and should be treated as a no-op.
    if (err instanceof Error && err.message === 'CSE machine not initialized') {
      return;
    }
    throw new Error('CSE machine is not enabled');
  }
}

export const externalBuiltIns = {
  display,
  rawDisplay,
  prompt: cadetPrompt,
  alert: cadetAlert,
  visualiseList: visualizeData,
};

/**
 * A wrapper around js-slang's createContext. This
 * provides the original function with the required
 * externalBuiltIns, such as display and prompt.
 */
export function createContext<T>(
  chapter: Chapter,
  externals: string[],
  externalContext: T,
  variant: Variant = Variant.DEFAULT,
  languageOptions?: LanguageOptions,
) {
  const context = createSlangContext<T>(
    chapter,
    variant,
    languageOptions,
    externals,
    externalContext,
    externalBuiltIns,
  );
  // js-slang's createContext initializes `moduleContexts` as a lazy-init Proxy
  // that writes to its target on every property read. Redux Toolkit (Immer)
  // freezes state, after which the proxy's `get` trap throws
  // "Cannot add property ..., object is not extensible" for any unknown key
  // (e.g. JSON.stringify probing `toJSON`). Replace with a plain object.
  context.moduleContexts = {};
  return context;
}
