import type { SlingClient } from '@sourceacademy/sling-client';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { actions } from 'src/commons/utils/ActionsHelper';

import { errorFromException } from '../../commons/errors/InterpreterError';
import type { DeviceSession } from '../remoteExecution/RemoteExecutionTypes';
import { createEv3Conductor, selectedEv3EvaluatorPath } from './createEv3Conductor';
import RemoteExecutionConductorActions from './RemoteExecutionConductorActions';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

let activeConductor: Awaited<ReturnType<typeof createEv3Conductor>> | null = null;
// The client activeConductor was built against - if a run comes in for a different client (the
// user reconnected, or switched devices), the old conductor is still wired to the old client's
// events and must be torn down and rebuilt rather than reused as-is.
let activeConductorClient: SlingClient | null = null;
// The evaluator activeConductor was built from. The selected language can change while the device
// stays connected, and the evaluator it needs with it (or there may be none, which a Run must
// report), so a conductor is reused only while this is still the selected language's EV3 evaluator.
let activeConductorEvaluatorPath: string | null = null;

function resetActiveConductor() {
  activeConductor?.conduit.terminate?.();
  activeConductor = null;
  activeConductorClient = null;
  activeConductorEvaluatorPath = null;
}

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
    resetActiveConductor();
  }

  try {
    // Throws for a language without an EV3 evaluator; the catch below shows that in the REPL.
    const evaluatorPath = selectedEv3EvaluatorPath();
    if (activeConductor && activeConductorEvaluatorPath !== evaluatorPath) {
      resetActiveConductor();
    }
    if (!activeConductor) {
      const createdConductor = yield call(
        createEv3Conductor,
        session.connection.client,
        evaluatorPath,
      );
      // createEv3Conductor awaits a network fetch - the session can disconnect or switch to a
      // different client while that's in flight, so re-check before adopting the result: without
      // this, a stale conductor could get cached and run against a client that's no longer current.
      const currentSession: DeviceSession | undefined = yield select(
        (state: OverallState) => state.session.remoteExecutionSession,
      );
      if (
        !currentSession ||
        currentSession.connection.status !== 'CONNECTED' ||
        currentSession.connection.client !== session.connection.client
      ) {
        createdConductor.conduit.terminate?.();
        return;
      }
      activeConductor = createdConductor;
      activeConductorClient = session.connection.client;
      activeConductorEvaluatorPath = evaluatorPath;
    }

    yield call([activeConductor!.plugin, activeConductor!.plugin.run], code);
  } catch (err) {
    // createEv3Conductor (worker fetch/creation) or plugin.run can throw - uncaught, this would
    // bubble through the saga tree since handleConductorRun is attached via takeEvery/fork/all,
    // stopping the whole conductor watcher rather than just failing this one run.
    const error = errorFromException(
      err instanceof Error ? err : new Error(String(err)),
      dummyLocation,
    );
    yield put(actions.evalInterpreterError([error], session.workspace));
    yield put(actions.updateWorkspace(session.workspace, { isRunning: false }));
  }
}

function* handleConductorDisconnect(): any {
  resetActiveConductor();
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
