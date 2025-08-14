import { defineSymbol } from 'js-slang/dist/createContext';
import { put, select, take } from 'redux-saga/effects';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

import type { OverallState } from '../../../application/ApplicationTypes';
import { actions } from '../../../utils/ActionsHelper';
import { getJsSlangContext } from '../../../utils/JsSlangContextStore';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';

export function* clearContext(workspaceLocation: WorkspaceLocation, entrypointCode: string) {
  const {
    contextId,
    externalLibrary: externalLibraryName,
    globals
  } = yield* selectWorkspace(workspaceLocation);
  
  const context = getJsSlangContext(contextId);
  if (!context) {
    throw new Error(`Context not found for workspace ${workspaceLocation}`);
  }

  const library = {
    chapter: context.chapter,
    variant: context.variant,
    external: {
      name: externalLibraryName,
      symbols: context.externalSymbols
    },
    globals
  };

  // Clear the context, with the same chapter and externalSymbols as before.
  yield put(actions.beginClearContext(workspaceLocation, library, false));
  // Wait for the clearing to be done.
  yield take(WorkspaceActions.endClearContext.type);

  const newContextId: string = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].contextId
  );
  const newContext = getJsSlangContext(newContextId);
  if (!newContext) {
    throw new Error(`New context not found for workspace ${workspaceLocation}`);
  }
  defineSymbol(newContext, '__PROGRAM__', entrypointCode);
}
