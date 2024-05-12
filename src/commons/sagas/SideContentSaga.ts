import { Action } from 'redux';
import type { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';
import { notifyStoriesEvaluated } from 'src/features/stories/StoriesActions';

import SideContentActions from '../sideContent/SideContentActions';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import { safeTakeEvery as takeEvery } from './SafeEffects';

const isSpawnSideContent = (
  action: Action
): action is ReturnType<typeof SideContentActions.spawnSideContent> =>
  action.type === SideContentActions.spawnSideContent.type;

export default function* SideContentSaga(): SagaIterator {
  yield takeEvery(
    SideContentActions.beginAlertSideContent.type,
    function* ({
      payload: { id, workspaceLocation }
    }: ReturnType<typeof SideContentActions.beginAlertSideContent>) {
      // When a program finishes evaluation, we clear all alerts,
      // So we must wait until after and all module tabs have been spawned
      // to process any kind of alerts that were raised by non-module side content
      yield take(
        (action: Action) =>
          isSpawnSideContent(action) && action.payload.workspaceLocation === workspaceLocation
      );
      yield put(SideContentActions.endAlertSideContent(id, workspaceLocation));
    }
  );

  yield takeEvery(
    notifyProgramEvaluated.type,
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
      yield put(
        SideContentActions.spawnSideContent(action.payload.workspaceLocation, debuggerContext)
      );
    }
  );

  yield takeEvery(
    notifyStoriesEvaluated.type,
    function* (action: ReturnType<typeof notifyStoriesEvaluated>) {
      yield put(
        SideContentActions.spawnSideContent(`stories.${action.payload.env}`, action.payload)
      );
    }
  );
}
