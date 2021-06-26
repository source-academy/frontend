import * as Sentry from '@sentry/browser';
import { infiniteLoopErrorType } from 'js-slang/dist/infiniteLoops/errorMessages';
import { Context, SourceError } from 'js-slang/dist/types';

function getInfiniteLoopErrors(errors: SourceError[]) {
  for (const error of errors) {
    const errorType = infiniteLoopErrorType(error.explain());
    if (errorType) return errorType;
  }
  return '';
}

/**
 * stringifies an array, similar to JSON.stringify, but is able to
 * 'stringify' functions in arrays (e.g. [(x=>x)]) -> "[(x=>x)]"
 * JSON.stringify will return [null]). Also written iteratively as
 * stringifying long (lispy) lists are likely to cause stack
 * overflows. Has a depth limit in case of circular references.
 *
 */
function stringifyArray(arr: any[]) {
  let result = '';
  const stack: [any[], integer][] = [[arr, 0]];
  while (stack.length > 0) {
    // arbitrary depth limit: 1000
    if (stack.length > 1000) return result + ' ...REDACTED]';
    const top = stack.pop() as [any[], integer];
    const topArr = top[0];
    let idx = top[1];
    if (idx === 0) result += '[';
    while (idx < topArr.length) {
      const elem = topArr[idx];
      if (Array.isArray(elem)) {
        stack.push([topArr, idx + 1]);
        stack.push([elem, 0]);
        break;
      } else if (typeof elem === 'function') {
        result += elem.toString();
      } else {
        result += JSON.stringify(elem);
      }
      if (idx !== topArr.length - 1) result += ',';
      idx++;
    }
    if (idx >= topArr.length) {
      const top = stack[stack.length - 1];
      result += ']';
      if (top && top[1] !== top[0].length) result += ',';
    }
  }
  return result;
}

/**
 * After running code in the REPL, the code from previous invocations/runs
 * are stored as native javascript objects in the Context's NativeStorage object.
 * This function turns these native objects back into string (transpiled code) form.
 * NOTE: variables trapped in closures can not be saved/recovered, e.g.
 * function f(x) {return (y)=>(x+y)}; //f(2).tostring() = "(y)=>(x+y)", 2 is gone forever
 *
 * @param {Globals} previousIdentifiers - Globals object from context.nativeStorage
 *
 * @returns {string} code
 */
function getPreviousCode(context: Context): string {
  let code = '';
  for (const key of context.nativeStorage.previousProgramsIdentifiers) {
    const theVar = context.nativeStorage.evaller!(key);
    //add newline for readability
    if (code !== '') code += '\n';
    if (typeof theVar === 'function') {
      code += `${theVar.toString()}`;
    } else if (Array.isArray(theVar)) {
      code += `const ${key}=${stringifyArray(theVar)};`;
    } else {
      code += `const ${key}=${JSON.stringify(theVar)};`;
    }
  }
  return code;
}

/**
 * Determines whether the error is an infinite loop, and returns a pair of [error type, code].
 * Constants (including functions) created from previous executions in the editor/REPL
 * will be stored as native Javascript objects. We will convert these objects
 * back into Source code and prepend it to the code that is being run.
 *
 * @param {Globals} scope - Globals object from context.nativeStorage
 * @param {string} code - last block of code that was executed
 *
 * @returns {[string, string]} [error type, code] if the error was an infinite loop
 * @returns {null} otherwise
 */
export function getInfiniteLoopData(context: Context, code: string) {
  const errors = getInfiniteLoopErrors(context.errors);
  if (errors) {
    return [errors, getPreviousCode(context)];
  } else {
    return null;
  }
}

/**
 * Sends the infinite loop data to Sentry. Uses a unique Sentry
 * fingerprint so all 'errors' reported here are grouped under a
 * single issue in Sentry.
 *
 * @param {string} errors - infinite loop error classification
 * @param {string} code - code to be sent along with the error
 */
export function reportInfiniteLoopError(errors: string, code: string) {
  Sentry.withScope(function (scope) {
    scope.clearBreadcrumbs();
    scope.setLevel(Sentry.Severity.Info);
    scope.setTag('code-type', errors);
    scope.setExtra('code', code);
    scope.setFingerprint(['INFINITE_LOOP_LOGGING_FINGERPRINT']);
    const err = new Error('Infinite Loop');
    // remove stack trace whenever we can to save space
    err.stack = '';
    Sentry.captureException(err);
  });
}
