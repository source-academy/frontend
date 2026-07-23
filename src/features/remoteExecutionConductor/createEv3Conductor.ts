import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { pickBy } from 'lodash-es';
import { actions } from 'src/commons/utils/ActionsHelper';
import type {
  Ev3DevicePeripherals,
  Ev3MotorData,
  Ev3MotorTypes,
  Ev3SensorData,
  Ev3SensorTypes,
} from 'src/features/remoteExecution/RemoteExecutionEv3Types';
import { store } from 'src/pages/createStore';

import { Ev3WebPlugin } from './Ev3WebPlugin';

const EV3_EVALUATOR_PATH = '/evaluators/ev3-remote-runner.js';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

export function createEv3Conductor(client: SlingClient): {
  plugin: Ev3WebPlugin;
  conduit: IConduit;
} {
  const worker = new Worker(EV3_EVALUATOR_PATH);
  const conduit = new Conduit(worker, true);

  const plugin = conduit.registerPlugin(Ev3WebPlugin);

  plugin.onResult = (svml: string) => {
    const binary = Buffer.from(svml, 'base64');
    client.sendRun(binary);
  };

  plugin.onError = (message: string) => {
    const currentSession = store.getState().session.remoteExecutionSession;
    if (!currentSession) {
      return;
    }
    const error = new ExceptionError(new Error(`${message}`), dummyLocation);
    store.dispatch(actions.evalInterpreterError([error], currentSession.workspace));
  };

  // Mirror legacy saga's monitor handler for peripheral data
  client.on('monitor', message => {
    const port = message[0].split(':')[1];
    const key = `port${port.substring(port.length - 1)}` as keyof Ev3DevicePeripherals;
    const currentSession = store.getState().session.remoteExecutionSession!;

    const dispatchAction = (peripheralData: Ev3MotorData | Ev3SensorData) =>
      store.dispatch(
        actions.remoteExecUpdateSession({
          ...currentSession,
          device: {
            ...currentSession.device,
            peripherals: {
              ...pickBy(currentSession.device.peripherals, p => Date.now() - p.lastUpdated < 3000),
              [key]: { ...peripheralData, lastUpdated: Date.now() },
            },
          },
        }),
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
    const currentSession = store.getState().session.remoteExecutionSession;
    if (!currentSession) {
      return;
    }
    const workspace = currentSession.workspace;
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

  return { plugin, conduit };
}
