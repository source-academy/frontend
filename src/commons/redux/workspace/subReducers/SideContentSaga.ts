import { Action } from '@reduxjs/toolkit';
import _ from 'lodash';
import { SagaIterator } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { getDynamicTabs } from 'src/commons/sideContent/SideContentHelper';

import { safeTakeEvery } from '../../utils/SafeEffects';
import { selectWorkspace } from '../../utils/Selectors';
import { allWorkspaceActions } from '../AllWorkspacesRedux';
import { WorkspaceState } from '../WorkspaceStateTypes';

const isNotifyProgramEvaluated = (
  action: Action
): action is ReturnType<typeof allWorkspaceActions.notifyProgramEvaluated> =>
  action.type === allWorkspaceActions.notifyProgramEvaluated.type;

export default function* SideContentSaga(): SagaIterator {
  yield safeTakeEvery(
    allWorkspaceActions.beginSpawnSideContent,
    function* ({ payload: { location }}) {
      const workspace: WorkspaceState = yield selectWorkspace(location)
      const debuggerContext = _.cloneDeep(workspace.debuggerContext)
      const dynamicTabs = yield call(getDynamicTabs, debuggerContext)
      yield put(allWorkspaceActions.endSpawnSideContent(location, dynamicTabs))
      yield put(allWorkspaceActions.updateWorkspace(location, { debuggerContext }))
    }
  )

  yield safeTakeEvery(
    allWorkspaceActions.beginAlertSideContent,
    function* ({
      payload
    }) {
      yield take(
        (action: Action) =>
          isNotifyProgramEvaluated(action) && action.payload.location === payload.location
      );
      yield put(allWorkspaceActions.endAlertSideContent(payload.location, payload.payload));
    }
  );
}
