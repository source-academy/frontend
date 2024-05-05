import { Context } from 'js-slang';
import { call } from 'redux-saga/effects';

import { getDifferenceInMethods, getRestoreExtraMethodsString } from '../../../utils/JsSlangHelper';
import { EVAL_SILENT, WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { evalCodeSaga } from './evalCode';

export function* restoreExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  unblockKey: string
) {
  const toUnblock = getDifferenceInMethods(elevatedContext, context);
  const restorer = getRestoreExtraMethodsString(toUnblock, unblockKey);
  const restorerFilePath = '/restorer.js';
  const restorerFiles = {
    [restorerFilePath]: restorer
  };
  yield call(
    evalCodeSaga,
    restorerFiles,
    restorerFilePath,
    elevatedContext,
    execTime,
    workspaceLocation,
    EVAL_SILENT
  );
}
