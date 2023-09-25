import { SlingClient } from '@sourceacademy/sling-client';
import { assemble, compileFiles } from 'js-slang';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { type Context, Chapter, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import { call, put, race, select } from 'redux-saga/effects';
import type {
  Ev3DevicePeripherals,
  Ev3MotorData,
  Ev3MotorTypes,
  Ev3SensorData,
  Ev3SensorTypes
} from 'src/features/remoteExecution/RemoteExecutionEv3Types';
import {
  type Device,
  type DeviceSession,
  deviceTypesById,
  WebSocketEndpointInformation
} from 'src/features/remoteExecution/RemoteExecutionTypes';
import { store } from 'src/pages/createStore';

import { fetchDevices, getDeviceWSEndpoint } from '../../sagas/RequestsSaga';
import type { MaybePromise } from '../../utils/TypeHelper';
import { OverallState } from '../AllTypes';
import { combineSagaHandlers, createActions } from '../utils';
import { safeTake as take,safeTakeEvery as takeEvery, safeTakeLatest as takeLatest } from '../utils/SafeEffects';
import { selectSession } from '../utils/Selectors';
import { allWorkspaceActions } from '../workspace/AllWorkspacesRedux';
import { SideContentLocation } from '../workspace/WorkspaceReduxTypes';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

const sagaActions = createActions('remoteExec', {
  remoteExecConnect: (location: SideContentLocation, device: Device) => ({ location, device }),
  remoteExecDisconnect: 0,
  remoteExecFetchDevices: 0,
  remoteExecRun: (files: Record<string, string>, entrypointFilePath: string) => ({
    files,
    entrypointFilePath
  }),
  remoteExecUpdateDevices: (devices: Device[]) => devices,
  remoteExecUpdateSession: (session?: DeviceSession) => session,
});

export const remoteExecutionSaga = combineSagaHandlers(
  sagaActions,
  {
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
          allWorkspaceActions.updateWorkspace(session.workspace, {
            isRunning: false
          })
        );
        return;
      }

      yield put(allWorkspaceActions.clearReplOutput(session.workspace));

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
        yield put(allWorkspaceActions.evalInterpreterError(session.workspace, context.errors));
        return;
      }
      const assembled = assemble(compiled);

      client.sendRun(Buffer.from(assembled));
    },
    remoteExecConnect: function* ({ payload: { device, location: workspace } }) {
      const [tokens, session]: [any, DeviceSession | undefined] = yield select(
        (state: OverallState) => [
          {
            accessToken: state.session.accessToken,
            refreshToken: state.session.refreshToken
          },
          state.session.remoteExecutionSession
        ]
      );
      yield put(
        sagaActions.remoteExecUpdateSession({
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
          sagaActions.remoteExecUpdateSession({
            device,
            workspace,
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
          allWorkspaceActions.updateWorkspace(workspace, {
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
            sagaActions.remoteExecUpdateSession({
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
            store.dispatch(allWorkspaceActions.handleConsoleLog(workspace, [`${message}`]));
            break;
          case 'error': {
            const error = new ExceptionError(new Error(`${message}`), dummyLocation);
            store.dispatch(allWorkspaceActions.evalInterpreterError(workspace, [error]));
            break;
          }
          case 'result':
            store.dispatch(allWorkspaceActions.evalInterpreterSuccess(workspace, message));
            break;
        }
      });
      const deviceType = deviceTypesById.get(device.type);

      yield put(
        sagaActions.remoteExecUpdateSession({
          device,
          workspace,
          connection: { status: 'CONNECTING', client, endpoint }
        })
      );
      yield put(
        allWorkspaceActions.updateWorkspace(workspace, {
          isRunning: false,
          editorState: {
            isEditorAutorun: false
          },
          isDebugging: false,
          repl: {
            output: []
          }
        })
      );
      yield put(
        allWorkspaceActions.beginClearContext(
          workspace,
          deviceType?.languageChapter || Chapter.SOURCE_3,
          Variant.DEFAULT,
          [],
          deviceType?.internalFunctions || []
        )
      );
      try {
        const connectPromise = new Promise<true>((resolve, reject) => {
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
          reconnect: take(sagaActions.remoteExecConnect),
          disconnect: take(sagaActions.remoteExecDisconnect)
        });
        if (connectOrCancel.connect) {
          yield put(
            sagaActions.remoteExecUpdateSession({
              device,
              workspace,
              connection: { status: 'CONNECTED', client, endpoint }
            })
          );
        } else {
          client.disconnect();
        }
      } catch (err) {
        client.disconnect();
        yield put(
          sagaActions.remoteExecUpdateSession({
            device,
            workspace,
            connection: { status: 'FAILED', client, error: err.toString() }
          })
        );
      }
    },
  },
  function* () {
    yield takeEvery(allWorkspaceActions.beginInterruptExecution, function* () {
      const session: DeviceSession | undefined = yield select(
        (state: OverallState) => state.session.remoteExecutionSession
      );
      if (!session || session.connection.status !== 'CONNECTED') {
        return;
      }

      yield call([session.connection.client, session.connection.client.sendStop]);
    });

    yield takeLatest(sagaActions.remoteExecFetchDevices, function* () {
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

      yield put(sagaActions.remoteExecUpdateDevices(devices));

      if (!session) {
        return;
      }
      const updatedDevice = devices.find(({ id }) => id === session.device.id);
      if (updatedDevice) {
        yield put(
          sagaActions.remoteExecUpdateSession({
            ...session,
            device: updatedDevice
          })
        );
      }
    })

    yield takeLatest(sagaActions.remoteExecDisconnect, function* () {
      const session: DeviceSession | undefined = yield selectSession(session => session.remoteExecutionSession)
      if (!session) {
        return;
      }
      const oldClient = session.connection.client;
      if (oldClient) {
        oldClient.disconnect();
      }
      yield put(sagaActions.remoteExecUpdateSession(undefined));
    })
  }
);

export const remoteExecutionActions = {
  ...sagaActions,
};

const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateClientNonce = () =>
  new Array(16)
    .fill(undefined)
    .map(_ => ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)])
    .join('');
