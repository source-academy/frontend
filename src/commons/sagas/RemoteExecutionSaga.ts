import { SlingClient } from '@sourceacademy/sling-client';
import { assemble, compile, Context } from 'js-slang';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { SagaIterator } from 'redux-saga';
import { call, put, race, select, take } from 'redux-saga/effects';

import {
  Device,
  DeviceSession,
  deviceTypesById,
  REMOTE_EXEC_CONNECT,
  REMOTE_EXEC_DISCONNECT,
  REMOTE_EXEC_FETCH_DEVICES,
  REMOTE_EXEC_RUN,
  WebSocketEndpointInformation
} from '../../features/remoteExecution/RemoteExecutionTypes';
import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { BEGIN_INTERRUPT_EXECUTION } from '../application/types/InterpreterTypes';
import { actions } from '../utils/ActionsHelper';
import { fetchDevices, getDeviceWSEndpoint } from './RequestsSaga';
import { safeTakeEvery as takeEvery, safeTakeLatest as takeLatest } from './SafeEffects';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

export function* remoteExecutionSaga(): SagaIterator {
  yield takeLatest(REMOTE_EXEC_FETCH_DEVICES, function* () {
    const [tokens, session]: [any, DeviceSession | undefined] = yield select(
      (state: OverallState) => [
        {
          accessToken: state.session.accessToken,
          refreshToken: state.session.refreshToken
        },
        state.session.remoteExecutionSession
      ]
    );
    const devices: Device[] = yield call(fetchDevices, tokens);

    yield put(actions.remoteExecUpdateDevices(devices));

    if (!session) {
      return;
    }
    const updatedDevice = devices.find(({ id }) => id === session.device.id);
    if (updatedDevice) {
      yield put(
        actions.remoteExecUpdateSession({
          ...session,
          device: updatedDevice
        })
      );
    }
  });

  yield takeEvery(REMOTE_EXEC_CONNECT, function* (
    action: ReturnType<typeof actions.remoteExecConnect>
  ) {
    const [tokens, session]: [any, DeviceSession | undefined] = yield select(
      (state: OverallState) => [
        {
          accessToken: state.session.accessToken,
          refreshToken: state.session.refreshToken
        },
        state.session.remoteExecutionSession
      ]
    );
    const { device, workspace } = action.payload;
    const endpoint: WebSocketEndpointInformation | null = yield call(
      getDeviceWSEndpoint,
      device,
      tokens
    );
    if (!endpoint) {
      yield put(
        actions.remoteExecUpdateSession({
          ...action.payload,
          connection: { status: 'FAILED', error: 'Could not retrieve MQTT endpoint' }
        })
      );
      return;
    }

    const oldClient = session?.connection.client;
    if (oldClient) {
      oldClient.disconnect();
    }
    const client: SlingClient = new SlingClient({
      clientId: `${endpoint.clientNamePrefix}${generateClientNonce()}`,
      deviceId: endpoint.thingName,
      websocketEndpoint: endpoint.endpoint
    });
    client.on('statusChange', isRunning => {
      store.dispatch(
        actions.updateWorkspace(workspace, {
          isRunning
        })
      );
    });
    client.on('display', (message, type) => {
      switch (type) {
        case 'output':
          store.dispatch(actions.handleConsoleLog(`${message}`, workspace));
          break;
        case 'error': {
          const error = new ExceptionError(new Error(`${message}`), dummyLocation);
          store.dispatch(actions.evalInterpreterError([error], workspace));
          break;
        }
        case 'result':
          store.dispatch(actions.evalInterpreterSuccess(message, workspace));
          break;
      }
    });
    const deviceType = deviceTypesById.get(device.type);

    yield put(
      actions.remoteExecUpdateSession({
        device,
        workspace,
        connection: { status: 'CONNECTING', client, endpoint }
      })
    );
    yield put(
      actions.updateWorkspace(workspace, {
        isRunning: false,
        isEditorAutorun: false,
        isDebugging: false,
        externalLibrary: deviceType?.deviceLibraryName,
        output: []
      })
    );
    yield put(
      actions.beginClearContext(
        workspace,
        {
          chapter: deviceType?.languageChapter || 3,
          variant: 'default',
          external: {
            name: deviceType?.deviceLibraryName || ExternalLibraryName.NONE,
            symbols: deviceType?.internalFunctions || []
          },
          globals: []
        },
        false
      )
    );
    try {
      const connectPromise = new Promise((resolve, reject) => {
        try {
          client.once('connect', () => resolve(true));
          client.once('error', reject);
          client.connect();
        } catch {
          reject();
        }
      });
      const connectOrCancel: {
        connect?: boolean;
      } = yield race({
        connect: connectPromise,
        reconnect: take(REMOTE_EXEC_CONNECT),
        disconnect: take(REMOTE_EXEC_DISCONNECT)
      });
      if (connectOrCancel.connect) {
        yield put(
          actions.remoteExecUpdateSession({
            ...action.payload,
            connection: { status: 'CONNECTED', client, endpoint }
          })
        );
      } else {
        client.disconnect();
      }
    } catch (err) {
      client.disconnect();
      yield put(
        actions.remoteExecUpdateSession({
          ...action.payload,
          connection: { status: 'FAILED', client, error: err.toString() }
        })
      );
    }
  });

  yield takeLatest(REMOTE_EXEC_DISCONNECT, function* (
    action: ReturnType<typeof actions.remoteExecDisconnect>
  ) {
    const session: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession
    );
    if (!session) {
      return;
    }
    const oldClient = session.connection.client;
    if (oldClient) {
      oldClient.disconnect();
    }
    yield put(actions.remoteExecUpdateSession(undefined));
    yield put(actions.externalLibrarySelect(ExternalLibraryName.NONE, session.workspace, true));
  });

  yield takeEvery(REMOTE_EXEC_RUN, function* ({
    payload: program
  }: ReturnType<typeof actions.remoteExecRun>) {
    const session: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession
    );
    if (!session) {
      return;
    }
    if (session.connection.status !== 'CONNECTED') {
      yield put(
        actions.updateWorkspace(session.workspace, {
          isRunning: false
        })
      );
      return;
    }

    yield put(actions.clearReplOutput(session.workspace));

    const client = session.connection.client;
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[session.workspace].context
    );
    // clear the context of errors (note: the way this works is that the context
    // is mutated by js-slang anyway, so it's ok to do it like this)
    context.errors.length = 0;
    const compiled: ReturnType<typeof compile> = yield call(
      compile,
      program,
      context,
      deviceTypesById.get(session.device.type)?.internalFunctions
    );
    if (!compiled) {
      yield put(actions.evalInterpreterError(context.errors, session.workspace));
      return;
    }
    const assembled = assemble(compiled);

    client.sendRun(Buffer.from(assembled));
  });

  yield takeEvery(BEGIN_INTERRUPT_EXECUTION, function* () {
    const session: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession
    );
    if (!session || session.connection.status !== 'CONNECTED') {
      return;
    }

    session.connection.client.sendStop();
  });
}

const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateClientNonce = () =>
  new Array(16)
    .fill(undefined)
    .map(_ => ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)])
    .join('');

export default remoteExecutionSaga;
