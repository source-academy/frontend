import { Action } from 'redux';
import type { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';
import { notifyStoriesEvaluated } from 'src/features/stories/StoriesActions';
import { NOTIFY_STORIES_EVALUATED } from 'src/features/stories/StoriesTypes';

import * as actions from '../sideContent/SideContentActions';
import {
  BEGIN_ALERT_SIDE_CONTENT,
  NOTIFY_PROGRAM_EVALUATED,
  SPAWN_SIDE_CONTENT
} from '../sideContent/SideContentTypes';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import { safeTakeEvery as takeEvery } from './SafeEffects';

const isSpawnSideContent = (
  action: Action
): action is ReturnType<typeof actions.spawnSideContent> => action.type === SPAWN_SIDE_CONTENT;

export default function* SideContentSaga(): SagaIterator {
  yield takeEvery(
    BEGIN_ALERT_SIDE_CONTENT,
    function* ({
      payload: { id, workspaceLocation }
    }: ReturnType<typeof actions.beginAlertSideContent>) {
      // When a program finishes evaluation, we clear all alerts,
      // So we must wait until after and all module tabs have been spawned
      // to process any kind of alerts that were raised by non-module side content
      yield take(
        (action: Action) =>
          isSpawnSideContent(action) && action.payload.workspaceLocation === workspaceLocation
      );
      yield put(actions.endAlertSideContent(id, workspaceLocation));
    }
  );

  yield takeEvery(
    NOTIFY_PROGRAM_EVALUATED,
    function* (action: ReturnType<typeof notifyProgramEvaluated>) {
      if (!action.payload.workspaceLocation || action.payload.workspaceLocation === 'stories')
        return;

      const debuggerContext = {
        result: action.payload.result,
        lastDebuggerResult: action.payload.lastDebuggerResult,
        code: action.payload.code,
        context: action.payload.context,
        workspaceLocation: action.payload.workspaceLocation
      };
      yield put(actions.spawnSideContent(action.payload.workspaceLocation, debuggerContext));
    }
  );

  yield takeEvery(
    NOTIFY_STORIES_EVALUATED,
    function* (action: ReturnType<typeof notifyStoriesEvaluated>) {
      yield put(actions.spawnSideContent(`stories.${action.payload.env}`, action.payload));
    }
  );
}
