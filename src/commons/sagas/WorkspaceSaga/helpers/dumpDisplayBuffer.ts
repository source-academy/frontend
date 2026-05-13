import { put, type StrictEffect } from 'redux-saga/effects';

import { actions } from '../../../utils/ActionsHelper';
import DisplayBufferService from '../../../utils/DisplayBufferService';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';

export function* dumpDisplayBuffer(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  yield put(actions.handleConsoleLog(workspaceLocation, ...DisplayBufferService.dump()));
}
