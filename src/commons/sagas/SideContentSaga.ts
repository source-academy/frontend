import { Action } from '@reduxjs/toolkit';
import { put, take } from 'redux-saga/effects';
import StoriesActions from 'src/features/stories/StoriesActions';

import { combineSagaHandlers } from '../redux/utils';
import SideContentActions from '../sideContent/SideContentActions';
import WorkspaceActions from '../workspace/WorkspaceActions';

const isSpawnSideContent = (
  action: Action
): action is ReturnType<typeof SideContentActions.spawnSideContent> =>
  action.type === SideContentActions.spawnSideContent.type;

// TODO: Refactor and combine in a future commit
const sagaActions = { ...SideContentActions, ...WorkspaceActions, ...StoriesActions };
export const SideContentSaga = combineSagaHandlers(sagaActions, {
  beginAlertSideContent: function* ({ payload: { id, workspaceLocation } }) {
    // When a program finishes evaluation, we clear all alerts,
    // So we must wait until after and all module tabs have been spawned
    // to process any kind of alerts that were raised by non-module side content
    yield take(
      (action: Action) =>
        isSpawnSideContent(action) && action.payload.workspaceLocation === workspaceLocation
    );
    yield put(SideContentActions.endAlertSideContent(id, workspaceLocation));
  },
  notifyProgramEvaluated: function* (action) {
    if (!action.payload.workspaceLocation || action.payload.workspaceLocation === 'stories') return;

    const debuggerContext = {
      result: action.payload.result,
      lastDebuggerResult: action.payload.lastDebuggerResult,
      code: action.payload.code,
      context: action.payload.context,
      workspaceLocation: action.payload.workspaceLocation
    };
    yield put(
      SideContentActions.spawnSideContent(action.payload.workspaceLocation, debuggerContext)
    );
  },
  notifyStoriesEvaluated: function* (action) {
    yield put(SideContentActions.spawnSideContent(`stories.${action.payload.env}`, action.payload));
  }
});

export default SideContentSaga;
