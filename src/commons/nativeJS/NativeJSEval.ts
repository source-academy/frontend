/* eslint-disable no-eval */
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { NativeJSEvalResult } from 'src/features/nativeJS/NativeJSTypes';

import { getEvalErrorLocation } from './EvalErrorLocator';

export function evalNativeJSProgram(program: string): NativeJSEvalResult {
  try {
    return { status: 'finished', value: eval(program) };
  } catch (error) {
    return {
      status: 'error',
      value: undefined,
      error: new ExceptionError(error, getEvalErrorLocation(error))
    };
  }
}
