import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { actions } from 'src/commons/utils/ActionsHelper';
import { store } from 'src/pages/createStore';

import { EV3_EVALUATOR_CAPABILITY } from '../conductor/stepperTab';
import { Ev3WebPlugin } from './Ev3WebPlugin';

// Local fallback only: used if the language directory has no EV3-capability evaluator for the
// currently selected language (e.g. local dev without a directory configured, or the directory
// entry not deployed yet). The real evaluator now comes from the language directory - see
// resolveEv3EvaluatorUrl below - so this file can be deleted once that's reliably in place
// everywhere this runs.
const EV3_EVALUATOR_FALLBACK_PATH = '/evaluators/ev3-remote-runner.js';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

/**
 * Resolves the EV3 evaluator's script URL from the language directory (the same mechanism that
 * already provides every other conductor evaluator - Py2JS, PyStepper, etc. - as a live URL rather
 * than a bundled file), instead of a hardcoded local path. Falls back to the locally-bundled copy
 * if no matching evaluator is found, so this degrades gracefully rather than breaking remote
 * execution entirely if the directory entry is ever missing or not yet deployed.
 */
function resolveEv3EvaluatorPath(): string {
  const { selectedLanguageId, languageMap } = store.getState().languageDirectory;
  const language = selectedLanguageId ? languageMap[selectedLanguageId] : undefined;
  const evaluator = language?.evaluators.find(e =>
    (e.capabilities as string[] | undefined)?.includes(EV3_EVALUATOR_CAPABILITY),
  );
  return evaluator?.path ?? EV3_EVALUATOR_FALLBACK_PATH;
}

/**
 * Classic (non-module) Workers - which is what Conductor's own worker protocol requires - enforce
 * same-origin loading for their script URL in every major browser, regardless of CORS headers.
 * That's different from a plain <script> tag or fetch(), which do respect CORS - so a cross-origin
 * evaluator URL (the language directory serves these from source-academy.github.io/py-slang/,
 * not this frontend's own origin) can't be passed to `new Worker(url)` directly; it silently fails
 * to load. Fetching the script ourselves (which does respect CORS) and constructing the Worker
 * from a same-origin Blob URL instead works around this.
 */
async function createWorkerFromUrl(url: string): Promise<Worker> {
  if (url.startsWith('/')) {
    // Same-origin local path (the fallback case) - no cross-origin issue, load directly.
    return new Worker(url);
  }
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Worker(objectUrl);
}

export async function createEv3Conductor(client: SlingClient): Promise<{
  plugin: Ev3WebPlugin;
  conduit: IConduit;
}> {
  const worker = await createWorkerFromUrl(resolveEv3EvaluatorPath());
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
