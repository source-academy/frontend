import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import type { SlingClient } from '@sourceacademy/sling-client';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { actions } from 'src/commons/utils/ActionsHelper';
import { store } from 'src/pages/createStore';

import { Ev3WebPlugin } from './Ev3WebPlugin';
import { resolveEv3EvaluatorPath } from './resolveEv3Evaluator';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

/** The selected language's EV3 evaluator URL, from the language directory - see resolveEv3Evaluator.ts. */
function selectedEv3EvaluatorPath(): string {
  const { selectedLanguageId, languageMap } = store.getState().languageDirectory;
  return resolveEv3EvaluatorPath(selectedLanguageId ? languageMap[selectedLanguageId] : undefined);
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
    // Same-origin path (e.g. a local-dev directory pointing at a locally served py-slang build) -
    // no cross-origin issue, load directly.
    return new Worker(url);
  }
  const response = await fetch(url);
  if (!response.ok) {
    // fetch() only rejects on network failure, not HTTP error status - without this check, an
    // error response body (e.g. a 404 page) would silently become the Worker's script source.
    throw new Error(`Failed to fetch EV3 evaluator (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Worker(objectUrl);
}

export async function createEv3Conductor(client: SlingClient): Promise<{
  plugin: Ev3WebPlugin;
  conduit: IConduit;
}> {
  const worker = await createWorkerFromUrl(selectedEv3EvaluatorPath());
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

  // Deliberately NOT registering client.on('monitor', ...) / client.on('display', ...) here:
  // RemoteExecutionSaga.ts's remoteExecConnect registers them on every connected client, and a
  // SlingClient is a plain multi-listener EventEmitter, so registering them again would apply every
  // print(), result, error and peripheral update from the device twice. This function wires only
  // what is unique to it: shipping a compiled result to the device (onResult, above) and surfacing
  // this *compile* worker's own errors (onError, above), which are local to the browser and not
  // device-reported ones.

  return { plugin, conduit };
}
