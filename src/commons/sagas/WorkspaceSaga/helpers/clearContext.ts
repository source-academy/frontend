import { Context } from 'js-slang';
import { defineSymbol } from 'js-slang/dist/createContext';
import { Variant } from 'js-slang/dist/types';
import { put, select, take } from 'redux-saga/effects';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

import { OverallState } from '../../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../../application/types/ExternalTypes';
import { actions } from '../../../utils/ActionsHelper';
import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';

export function* clearContext(workspaceLocation: WorkspaceLocation, entrypointCode: string) {
  const [chapter, symbols, externalLibraryName, globals, variant]: [
    number,
    string[],
    ExternalLibraryName,
    Array<[string, any]>,
    Variant
  ] = yield select((state: OverallState) => [
    state.workspaces[workspaceLocation].context.chapter,
    state.workspaces[workspaceLocation].context.externalSymbols,
    state.workspaces[workspaceLocation].externalLibrary,
    state.workspaces[workspaceLocation].globals,
    state.workspaces[workspaceLocation].context.variant
  ]);

  const library = {
    chapter,
    variant,
    external: {
      name: externalLibraryName,
      symbols
    },
    globals
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
