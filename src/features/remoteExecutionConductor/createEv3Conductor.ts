import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { actions } from 'src/commons/utils/ActionsHelper';
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

  // Deliberately NOT registering client.on('monitor', ...) / client.on('display', ...) here. This
  // function used to duplicate both handlers verbatim from RemoteExecutionSaga.ts's own
  // remoteExecConnect - which registers them unconditionally on every connect, regardless of which
  // run pipeline (this Conductor one, or the legacy js-slang/SVML one in RemoteExecutionSaga.ts) is
  // used once connected. Since remoteExecConnect is the only connect path actually dispatched
  // anywhere (remoteExecConductorConnect, defined alongside remoteExecConductorDisconnect in
  // RemoteExecutionConductorActions.ts, is never dispatched), that meant every 'display'/'monitor'
  // event the device published got delivered to BOTH sets of listeners on the same SlingClient
  // (SlingClient extends a plain multi-listener EventEmitter, so both would always fire) - each
  // independently dispatching the same handleConsoleLog/evalInterpreterSuccess/evalInterpreterError/
  // remoteExecUpdateSession action. That is the confirmed root cause of every print() (and result/
  // error/peripheral update) from the device being applied exactly twice in the frontend, for the
  // entire lifetime of a single connection - not a reconnect-time leak of a stale conductor, and not
  // MQTT redelivery. RemoteExecutionSaga.ts's listeners already cover this for any connected client
  // regardless of pipeline, so this function only wires up what's actually unique to it: shipping a
  // compiled result to the device (onResult, above) and surfacing this *compile* worker's own errors
  // (onError, above) - which are local-to-the-browser compile failures, not device-reported ones, so
  // they are not a duplicate of RemoteExecutionSaga.ts's 'display' 'error' case.

  return { plugin, conduit };
}
