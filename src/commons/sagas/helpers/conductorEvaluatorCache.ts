import type { IConduit } from '@sourceacademy/conductor/conduit';
import type { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import type { BrowserHostPlugin } from '../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../features/conductor/createConductor';

type PreparedConductor = {
  path: string;
  evaluatorUrl: string;
  hostPlugin: BrowserHostPlugin;
  conduit: IConduit;
  setFiles: (files: Record<string, string>) => void;
};

type GetPreparedConductorOptions = {
  files?: Record<string, string>;
  consume?: boolean;
};

let preparedConductorPath: string | null = null;
let preparedConductor: PreparedConductor | null = null;
let loadingConductorPath: string | null = null;
let loadingConductorPromise: Promise<PreparedConductor> | null = null;
let currentEvaluatorPath: string | null = null;

async function fetchEvaluatorObjectUrl(path: string): Promise<string> {
  const evaluatorResponse = await fetch(path);
  if (!evaluatorResponse.ok) {
    throw Error("can't get evaluator");
  }

  const evaluatorBlob = await evaluatorResponse.blob();
  return URL.createObjectURL(evaluatorBlob);
}

async function terminatePreparedConductor(conductor: PreparedConductor | null) {
  if (!conductor) {
    return;
  }

  await conductor.conduit.terminate();
  URL.revokeObjectURL(conductor.evaluatorUrl);
}

function resetPreparedConductor() {
  preparedConductorPath = null;
  preparedConductor = null;
}

function* cleanupPreparedConductorSaga(): SagaIterator {
  const conductorToTerminate = preparedConductor;
  resetPreparedConductor();
  yield call(terminatePreparedConductor, conductorToTerminate);
}

async function createPreparedConductor(path: string): Promise<PreparedConductor> {
  const evaluatorUrl = await fetchEvaluatorObjectUrl(path);

  let currentFiles: Record<string, string> = {};
  const { hostPlugin, conduit } = createConductor(
    evaluatorUrl,
    async (fileName: string) => currentFiles[fileName],
    (_pluginName: string) => {
      // TODO: implement dynamic plugin loading
    }
  );

  return {
    path,
    evaluatorUrl,
    hostPlugin,
    conduit,
    setFiles: (files: Record<string, string>) => {
      currentFiles = files;
    }
  };
}

function* ensurePreparedConductorSaga(path: string): SagaIterator<PreparedConductor> {
  if (preparedConductorPath === path && preparedConductor) {
    return preparedConductor;
  }

  if (loadingConductorPath === path && loadingConductorPromise) {
    return yield call(() => loadingConductorPromise as Promise<PreparedConductor>);
  }

  // A new evaluator path is requested, so release the old preloaded conductor first.
  yield call(cleanupPreparedConductorSaga);

  loadingConductorPath = path;
  loadingConductorPromise = createPreparedConductor(path)
    .then(prepared => {
      preparedConductorPath = path;
      preparedConductor = prepared;
      return prepared;
    })
    .finally(() => {
      loadingConductorPath = null;
      loadingConductorPromise = null;
    });

  return yield call(() => loadingConductorPromise as Promise<PreparedConductor>);
}

export function* preloadConductorEvaluatorSaga(path?: string): SagaIterator {
  if (!path) {
    return;
  }

  currentEvaluatorPath = path;
  yield call(ensurePreparedConductorSaga, path);
}

/**
 * Returns a conductor for the current evaluator path, preferring a preloaded instance.
 * The returned conductor is consumed from the cache and should be terminated by the caller.
 */
export function* getPreparedConductorSaga(
  options?: GetPreparedConductorOptions
): SagaIterator<{ hostPlugin: BrowserHostPlugin; conduit: IConduit }> {
  if (!currentEvaluatorPath) {
    throw Error('no evaluator path selected');
  }

  const path = currentEvaluatorPath;
  const prepared: PreparedConductor = yield call(ensurePreparedConductorSaga, path);
  const files = options?.files;
  const consume = options?.consume ?? false;

  if (files) {
    prepared.setFiles(files);
  }

  // Consume only when requested (e.g. for program evaluation, not autocomplete requests).
  if (consume && preparedConductor === prepared) {
    resetPreparedConductor();
  }

  return { hostPlugin: prepared.hostPlugin, conduit: prepared.conduit };
}
