import { Context } from 'js-slang/dist/types';

import { handleConsoleLog } from '../application/actions/InterpreterActions';

export function makeExternalBuiltins(context: Context): any {
  return {
    display: (v: string) => {
      if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
        (window as any).__REDUX_STORE__.dispatch(handleConsoleLog(context.externalContext, v));
      }
    }
  };
}
