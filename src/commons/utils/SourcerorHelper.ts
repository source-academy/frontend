import { Context } from 'js-slang/dist/types';

import { actions } from '../redux/ActionsHelper';

export function makeExternalBuiltins(context: Context): any {
  return {
    display: (v: string) => {
      if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
        (window as any).__REDUX_STORE__.dispatch(
          actions.handleConsoleLog(context.externalContext, [v])
        );
      }
    }
  };
}
