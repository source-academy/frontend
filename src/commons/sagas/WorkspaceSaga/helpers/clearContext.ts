import type { Context } from 'js-slang';
import { defineSymbol } from 'js-slang/dist/createContext';
import { put, select, take } from 'redux-saga/effects';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

import type { OverallState } from '../../../application/ApplicationTypes';
import { actions } from '../../../utils/ActionsHelper';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';

export function* clearContext(workspaceLocation: WorkspaceLocation, entrypointCode: string) {
  const {
    context: { chapter, externalSymbols: symbols, variant, languageOptions },
    externalLibrary: externalLibraryName,
    globals
  } = yield* selectWorkspace(workspaceLocation);

  const library = {
    chapter,
    variant,
    external: {
      name: externalLibraryName,
      symbols
    },
    globals,
    languageOptions
  };

  // Clear the context, with the same chapter and externalSymbols as before.
  yield put(actions.beginClearContext(workspaceLocation, library, false));
  // Wait for the clearing to be done.
  yield take(WorkspaceActions.endClearContext.type);

  const context: Context = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context
  );
  defineSymbol(context, '__PROGRAM__', entrypointCode);
}
