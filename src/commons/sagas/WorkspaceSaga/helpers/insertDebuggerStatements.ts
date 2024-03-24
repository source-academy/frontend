import { Context } from 'js-slang';
import { parse } from 'js-slang/dist/parser/parser';
import { put, StrictEffect } from 'redux-saga/effects';

import { isSourceLanguage } from '../../../application/ApplicationTypes';
import { actions } from '../../../utils/ActionsHelper';
import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';

/**
 * Inserts debugger statements into the code based off the breakpoints set by the user.
 *
 * For every breakpoint, a corresponding `debugger;` statement is inserted at the start
 * of the line that the breakpoint is placed at. The `debugger;` statement is available
 * in both JavaScript and Source, and invokes any available debugging functionality.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
 * for more information.
 *
 * While it is typically the case that statements are contained within a single line,
 * this is not necessarily true. For example, the code `const x = 3;` can be rewritten as:
 * ```
 * const x
 * = 3;
 * ```
 * A breakpoint on the line `= 3;` would thus result in a `debugger;` statement being
 * added in the middle of another statement. The resulting code would then be syntactically
 * invalid.
 *
 * To work around this issue, we parse the code to check for syntax errors whenever we
 * add a `debugger;` statement. If the addition of a `debugger;` statement results in
 * invalid code, an error message is outputted with the line number of the offending
 * breakpoint.
 *
 * @param workspaceLocation The location of the current workspace.
 * @param code              The code which debugger statements should be inserted into.
 * @param breakpoints       The breakpoints corresponding to the code.
 * @param context           The context in which the code should be evaluated in.
 */
export function* insertDebuggerStatements(
  workspaceLocation: WorkspaceLocation,
  code: string,
  breakpoints: string[],
  context: Context
): Generator<StrictEffect, string, any> {
  // Check for initial syntax errors.
  if (isSourceLanguage(context.chapter)) {
    parse(code, context);
  }

  // If there are syntax errors, we do not insert the debugger statements.
  // Instead, we let the code be evaluated so that the error messages are printed.
  if (context.errors.length > 0) {
    context.errors = [];
    return code;
  }

  // Otherwise, we step through the breakpoints one by one & try to insert
  // corresponding debugger statements.
  const lines = code.split('\n');
  let transformedCode = code;
  for (let i = 0; i < breakpoints.length; i++) {
    if (!breakpoints[i]) continue;
    lines[i] = 'debugger;' + lines[i];
    // Reconstruct the code & check that the code is still syntactically valid.
    // The insertion of the debugger statement is potentially invalid if it
    // happens within an existing statement (that is split across lines).
    transformedCode = lines.join('\n');
    if (isSourceLanguage(context.chapter)) {
      parse(transformedCode, context);
    }
    // If the resulting code is no longer syntactically valid, throw an error.
    if (context.errors.length > 0) {
      const errorMessage = `Hint: Misplaced breakpoint at line ${i + 1}.`;
      yield put(actions.sendReplInputToOutput(errorMessage, workspaceLocation));
      return code;
    }
  }

  /*
  Not sure how this works, but there were some issues with breakpoints
  I'm not sure why `in` is being used here, given that it's usually not
  the intended effect

  for (const breakpoint in breakpoints) {
    // Add a debugger statement to the line with the breakpoint.
    const breakpointLineNum: number = parseInt(breakpoint);
    lines[breakpointLineNum] = 'debugger;' + lines[breakpointLineNum];
    // Reconstruct the code & check that the code is still syntactically valid.
    // The insertion of the debugger statement is potentially invalid if it
    // happens within an existing statement (that is split across lines).
    transformedCode = lines.join('\n');
    if (isSourceLanguage(context.chapter)) {
      parse(transformedCode, context);
    }
    // If the resulting code is no longer syntactically valid, throw an error.
    if (context.errors.length > 0) {
      const errorMessage = `Hint: Misplaced breakpoint at line ${breakpointLineNum + 1}.`;
      yield put(actions.sendReplInputToOutput(errorMessage, workspaceLocation));
      return code;
    }
  }
  */

  // Finally, return the transformed code with debugger statements added.
  return transformedCode;
}
