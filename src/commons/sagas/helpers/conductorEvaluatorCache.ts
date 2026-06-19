import type { IConduit } from '@sourceacademy/conductor/conduit';
import { PluginType } from '@sourceacademy/plugin-directory/src';
import type { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import type { BrowserHostPlugin } from '../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../features/conductor/createConductor';
import type { CseMachineHostPlugin } from '../../../features/conductor/CseMachineHostPlugin';
import {
  clearPluginTabs,
  registerPluginTabIfPresent,
} from '../../../features/conductor/pluginTabRegistry';
import { store } from '../../../pages/createStore';

type PreparedConductor = {
  path: string;
  evaluatorUrl: string;
  hostPlugin: BrowserHostPlugin;
  csePlugin: CseMachineHostPlugin;
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
  clearPluginTabs();
  yield call(terminatePreparedConductor, conductorToTerminate);
}

/**
 * Loads a web plugin requested by the runner. The plugin's web-half URL is resolved generically
 * from the plugin directory (`resolutions[WEB]`); after registering it, any side-content tab it
 * exposes is surfaced to the UI. This is plugin-agnostic — no per-plugin code lives here.
 */
/**
 * Resolves a plugin's web-half URL from the plugin directory. The runner may request a plugin
 * before the directory has finished loading, so we poll briefly for it.
 */
async function resolveWebPluginUrl(pluginId: string): Promise<string | undefined> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const url = store.getState().pluginDirectory.pluginMap?.[pluginId]?.resolutions?.[PluginType.WEB];
    if (url) return url;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return undefined;
}

async function loadWebPlugin(
  hostPlugin: BrowserHostPlugin | undefined,
  pluginId: string,
): Promise<void> {
  if (!hostPlugin) return;
  const url = await resolveWebPluginUrl(pluginId);
  if (!url) {
    // eslint-disable-next-line no-console
    console.warn(
      `Conductor: no web resolution for plugin "${pluginId}" (is directory.plugin.url set?)`,
    );
    return;
  }
  try {
    const plugin = await hostPlugin.importAndRegisterExternalPlugin(url);
    if (preparedConductor?.hostPlugin === hostPlugin) {
      registerPluginTabIfPresent(plugin);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Conductor: failed to load web plugin "${pluginId}"`, error);
  }
}

async function createPreparedConductor(path: string): Promise<PreparedConductor> {
  const evaluatorUrl = await fetchEvaluatorObjectUrl(path);

  let currentFiles: Record<string, string> = {};
  let hostPluginRef: BrowserHostPlugin | undefined = undefined;
  const { hostPlugin, csePlugin, conduit } = createConductor(
    evaluatorUrl,
    async (fileName: string) => currentFiles[fileName],
    (pluginName: string) => {
      void loadWebPlugin(hostPluginRef, pluginName);
    },
  );
  hostPluginRef = hostPlugin;

  return {
    path,
    evaluatorUrl,
    hostPlugin,
    csePlugin,
    conduit,
    setFiles: (files: Record<string, string>) => {
      currentFiles = files;
    },
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
export function* getPreparedConductorSaga(options?: GetPreparedConductorOptions): SagaIterator<{
  hostPlugin: BrowserHostPlugin;
  csePlugin: CseMachineHostPlugin;
  conduit: IConduit;
}> {
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

  return {
    hostPlugin: prepared.hostPlugin,
    csePlugin: prepared.csePlugin,
    conduit: prepared.conduit,
  };
}
