import type { SlingClient } from '@sourceacademy/sling-client';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { actions } from 'src/commons/utils/ActionsHelper';

import type { DeviceSession } from '../remoteExecution/RemoteExecutionTypes';
import { createEv3Conductor } from './createEv3Conductor';
import RemoteExecutionConductorActions from './RemoteExecutionConductorActions';

let activeConductor: ReturnType<typeof createEv3Conductor> | null = null;
// The client activeConductor was built against - if a run comes in for a different client (the
// user reconnected, or switched devices), the old conductor is still wired to the old client's
// events and must be torn down and rebuilt rather than reused as-is.
let activeConductorClient: SlingClient | null = null;

function* handleConductorRun(
  action: ReturnType<typeof RemoteExecutionConductorActions.remoteExecConductorRun>,
): any {
  const session: DeviceSession | undefined = yield select(
    (state: OverallState) => state.session.remoteExecutionSession,
  );

  if (!session || session.connection.status !== 'CONNECTED') {
    yield put(actions.updateWorkspace(session?.workspace ?? 'playground', { isRunning: false }));
    return;
  }

  yield put(actions.clearReplOutput(session.workspace));

  const { files, entrypointFilePath } = action.payload;
  const code = files[entrypointFilePath];

  if (activeConductor && activeConductorClient !== session.connection.client) {
    activeConductor.conduit.terminate?.();
    activeConductor = null;
    activeConductorClient = null;
  }

  if (!activeConductor) {
    activeConductor = yield call(createEv3Conductor, session.connection.client);
    activeConductorClient = session.connection.client;
  }

  yield call([activeConductor!.plugin, activeConductor!.plugin.run], code);
}

function* handleConductorDisconnect(): any {
  activeConductor?.conduit.terminate?.();
  activeConductor = null;
  activeConductorClient = null;
  yield; // satisfies require-yield
}

export function* RemoteExecutionConductorSaga() {
  yield takeEvery(RemoteExecutionConductorActions.remoteExecConductorRun, handleConductorRun);
  yield takeEvery(
    RemoteExecutionConductorActions.remoteExecConductorDisconnect,
    handleConductorDisconnect,
  );
}

export default RemoteExecutionConductorSaga;
