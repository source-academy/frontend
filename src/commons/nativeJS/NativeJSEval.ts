/* eslint-disable no-eval */
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { SourceError } from 'js-slang/dist/types';
import { NativeJSEvalResult } from 'src/features/nativeJS/NativeJSTypes';

/**
 * This function uses the non-standard feature `Error.prototype.stack`.
 * Not working for SyntaxError.
 *
 * Some examples:
 * `@http://localhost:8000/static/js/main.chunk.js line 31925 > eval:1:1
 *     evalNativeJSProgram@http://localhost:8000/static/js/main.chunk.js:31925:16` --Firefox 91.4.1esr
 * `TypeError: window.dsl is not a function at eval (eval at evalNativeJSProgram (NativeJSEval.ts:6:1), <anonymous>:1:8)` --Chrome 98.0.4758.9
 * Seeking better alternative for this.
 */
function getErrorLocation(error: Error, lineOffset: number = 0): SourceError['location'] {
  const DUMMY_LOCATION = {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 }
  };
  // In case `Error.stack` is undefined, eg. `eval(const enum = 1;)`
  if (error.stack) {
    const firefoxStyle = (error.stack as string).split('\n')[0].split('eval:');
    const chromeStyle = (error.stack as string).split('\n')[1].split('<anonymous>:');

    if (firefoxStyle.length > 1) {
      const locationArray = firefoxStyle[1].slice(0, -1).split(':');
      return {
        start: {
          line: parseInt(locationArray[0]) - lineOffset,
          column: parseInt(locationArray[1])
        },
        end: { line: 0, column: 0 }
      };
    } else if (chromeStyle.length > 1) {
      const locationArray = chromeStyle[1].slice(0, -1).split(':');
      return {
        start: {
          line: parseInt(locationArray[0]) - lineOffset,
          column: parseInt(locationArray[1])
        },
        end: { line: 0, column: 0 }
      };
    } else if ((error as any).lineNumber) {
      // Fallback to final attempt: the non-standard `Error.lineNumber` feature supported by Firefox
      return {
        start: { line: (error as any).lineNumber - lineOffset, column: 0 },
        end: { line: 0, column: 0 }
      };
    }
  }

  return DUMMY_LOCATION;
}

export function evalNativeJSProgram(program: string): NativeJSEvalResult {
  try {
    return { status: 'finished', value: eval(program) };
  } catch (error) {
    return {
      status: 'error',
      value: undefined,
      error: new ExceptionError(error, getErrorLocation(error))
    };
  }
}
