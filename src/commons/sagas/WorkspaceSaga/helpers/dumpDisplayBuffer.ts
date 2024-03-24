import { put, StrictEffect } from 'redux-saga/effects';

import { actions } from '../../../utils/ActionsHelper';
import DisplayBufferService from '../../../utils/DisplayBufferService';
import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';

export function* dumpDisplayBuffer(
  workspaceLocation: WorkspaceLocation,
  isStoriesBlock: boolean = false,
  storyEnv?: string
): Generator<StrictEffect, void, any> {
  if (!isStoriesBlock) {
    yield put(actions.handleConsoleLog(workspaceLocation, ...DisplayBufferService.dump()));
  } else {
    yield put(actions.handleStoriesConsoleLog(storyEnv!, ...DisplayBufferService.dump()));
  }
}
