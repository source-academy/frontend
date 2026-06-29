import { BasicHostPlugin } from '@sourceacademy/conductor/host';
import { call, select, takeEvery } from 'redux-saga/effects';
import type { DeviceSession } from '../remoteExecution/RemoteExecutionTypes';
import { createEv3Conductor, EV3_EVALUATOR_PATH } from './createEv3Conductor';
import RemoteExecutionConductorActions from './RemoteExecutionConductorActions';

let activeConductor: ReturnType<typeof createEv3Conductor> | null = null;

function* handleConductorRun(
  action: ReturnType<typeof RemoteExecutionConductorActions.remoteExecConductorRun>,
): any {
  const session: DeviceSession | undefined = yield select(
    state => state.remoteExecutionConductor.session,
  );

  if (!session || session.connection.status !== 'CONNECTED') {
    // dispatch error to REPL using whichever action the existing saga uses
    return;
  }

  const { files, entrypointFilePath } = action.payload;
  const code = files[entrypointFilePath];

  if (!activeConductor) {
    activeConductor = createEv3Conductor(
      session.connection.client,
      async () => undefined,
      () => {},
    );
  }

  // Submit code to the EV3 worker — conductor handles the rest
  if (!activeConductor) {
    activeConductor = createEv3Conductor(
        session.connection.client,
        async () => undefined,
        () => {},
    );
    }  

    const hostPlugin = activeConductor.hostPlugin as unknown as BasicHostPlugin;
    hostPlugin.startEvaluator(EV3_EVALUATOR_PATH);

    yield call(
    [hostPlugin, hostPlugin.sendChunk],
    { code, filePath: entrypointFilePath }
    );
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
