import { call, put, select, takeEvery } from 'redux-saga/effects';
import { actions } from 'src/commons/utils/ActionsHelper';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import type { DeviceSession } from '../remoteExecution/RemoteExecutionTypes';
import { createEv3Conductor } from './createEv3Conductor';
import RemoteExecutionConductorActions from './RemoteExecutionConductorActions';

let activeConductor: ReturnType<typeof createEv3Conductor> | null = null;

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

  if (!activeConductor) {
    activeConductor = yield call(createEv3Conductor, session.connection.client);
  }

  yield call([activeConductor!.plugin, activeConductor!.plugin.run], code);
}

function* handleConductorDisconnect(): any {
  activeConductor?.conduit.terminate?.();
  activeConductor = null;
}

export function* remoteExecutionConductorSaga() {
  yield takeEvery(RemoteExecutionConductorActions.remoteExecConductorRun, handleConductorRun);
  yield takeEvery(
    RemoteExecutionConductorActions.remoteExecConductorDisconnect,
    handleConductorDisconnect,
  );
}

export default remoteExecutionConductorSaga;