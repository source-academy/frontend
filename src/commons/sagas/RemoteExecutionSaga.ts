import { SlingClient } from '@sourceacademy/sling-client';
import { assemble, compileFiles, Context } from 'js-slang';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import { call, put, race, select, take } from 'redux-saga/effects';
import RemoteExecutionActions from 'src/features/remoteExecution/RemoteExecutionActions';
import {
  Ev3DevicePeripherals,
  Ev3MotorData,
  Ev3MotorTypes,
  Ev3SensorData,
  Ev3SensorTypes
} from 'src/features/remoteExecution/RemoteExecutionEv3Types';
import {
  Device,
  DeviceSession,
  deviceTypesById,
  WebSocketEndpointInformation
} from 'src/features/remoteExecution/RemoteExecutionTypes';
import { store } from 'src/pages/createStore';

import InterpreterActions from '../application/actions/InterpreterActions';
import { OverallState } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';
import { MaybePromise } from '../utils/TypeHelper';
import { fetchDevices, getDeviceWSEndpoint } from './RequestsSaga';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

// TODO: Refactor and combine in a future commit
const sagaActions = { ...RemoteExecutionActions, ...InterpreterActions };
const RemoteExecutionSaga = combineSagaHandlers(sagaActions, {
  // TODO: Should be `takeLatest`, not `takeEvery`
  remoteExecFetchDevices: function* () {
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
  },
  remoteExecConnect: function* (action): any {
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
    yield put(
      actions.remoteExecUpdateSession({
        device,
        workspace,
        connection: { status: 'CONNECTING' }
      })
    );
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
      try {
        oldClient.disconnect();
      } catch {}
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
    client.on('monitor', message => {
      const port = message[0].split(':')[1];
      const key = `port${port.substring(port.length - 1)}` as keyof Ev3DevicePeripherals;
      const currentSession = store.getState().session.remoteExecutionSession!; // Guaranteed valid session

      const dispatchAction = (peripheralData: Ev3MotorData | Ev3SensorData) =>
        store.dispatch(
          actions.remoteExecUpdateSession({
            ...currentSession,
            device: {
              ...currentSession.device,
              peripherals: {
                ..._.pickBy(
                  currentSession.device.peripherals,
                  p => Date.now() - p.lastUpdated < 3000
                ),
                [key]: { ...peripheralData, lastUpdated: Date.now() }
              }
            }
          })
        );

      if (message[1].endsWith('motor')) {
        const type = message[1] as Ev3MotorTypes;
        const position = parseInt(message[2]);
        const speed = parseInt(message[3]);
        const peripheralData: Ev3MotorData = { type, position, speed };
        dispatchAction(peripheralData);
      } else {
        const type = message[1] as Ev3SensorTypes;
        const mode = message[2] as any;
        const value = parseInt(message[3]);
        const peripheralData: Ev3SensorData = { type, mode, value };
        dispatchAction(peripheralData);
      }
    });

    client.on('display', (message, type) => {
      switch (type) {
        case 'output':
          store.dispatch(actions.handleConsoleLog(workspace, `${message}`));
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
          chapter: deviceType?.languageChapter || Chapter.SOURCE_3,
          variant: Variant.DEFAULT,
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
        reconnect: take(RemoteExecutionActions.remoteExecConnect.type),
        disconnect: take(RemoteExecutionActions.remoteExecDisconnect.type)
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
  },
  remoteExecDisconnect: function* (action) {
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
  },
  remoteExecRun: function* (action) {
    const { files, entrypointFilePath } = action.payload;

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
    const compiled: MaybePromise<ReturnType<typeof compileFiles>> = yield call(
      compileFiles,
      files,
      entrypointFilePath,
      context,
      deviceTypesById.get(session.device.type)?.internalFunctions
    );
    if (!compiled) {
      yield put(actions.evalInterpreterError(context.errors, session.workspace));
      return;
    }
    const assembled = assemble(compiled);

    client.sendRun(Buffer.from(assembled));
  },
  beginInterruptExecution: function* () {
    const session: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession
    );
    if (!session || session.connection.status !== 'CONNECTED') {
      return;
    }

    session.connection.client.sendStop();
  }
});

const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateClientNonce = () =>
  new Array(16)
    .fill(undefined)
    .map(_ => ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)])
    .join('');

export default RemoteExecutionSaga;
