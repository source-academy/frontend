import { ModulesGlobalConfig as CCompilerConfig } from 'ctowasm';
import { Context } from 'js-slang/dist/types';

import { handleConsoleLog } from '../application/actions/InterpreterActions';

export function makeCCompilerConfig(context: Context): CCompilerConfig {
  return {
    printFunction: (v: string) => {
      if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
        (window as any).__REDUX_STORE__.dispatch(handleConsoleLog(context.externalContext, v));
      }
    }
  };
}
