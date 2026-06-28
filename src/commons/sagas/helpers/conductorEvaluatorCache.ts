import type { IConduit } from '@sourceacademy/conductor/conduit';
import { PluginType } from '@sourceacademy/plugin-directory';
import type { SagaIterator } from 'redux-saga';
import { call, select } from 'redux-saga/effects';
import { requireProvider } from 'src/commons/sideContent/SideContentHelper';
import { registry } from 'src/features/conductor/Registry';
import { selectDirectoryPluginUrl } from 'src/features/directory/flagDirectoryPluginUrl';

import type { BrowserHostPlugin } from '../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../features/conductor/createConductor';
import type { CseMachineHostPlugin } from '../../../features/conductor/CseMachineHostPlugin';
import type { OverallState } from '../../application/ApplicationTypes';
import sideContentManager from '../../sideContent/SideContentManager';
import type { SideContentLocation } from '../../sideContent/SideContentTypes';

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
  workspaceLocation?: SideContentLocation;
};

let preparedConductorPath: string | null = null;
let preparedConductor: PreparedConductor | null = null;
let loadingConductorPath: string | null = null;
let loadingConductorPromise: Promise<PreparedConductor> | null = null;
let currentEvaluatorPath: string | null = null;
let currentPluginDirectoryUrl: string | null = null;
let currentPluginMap: OverallState['pluginDirectory']['pluginMap'] = {};

function getWebPluginLocation(pluginName: string): string | undefined {
  return currentPluginMap[pluginName]?.resolutions[PluginType.WEB];
}

function* updatePluginDirectorySnapshotSaga(): SagaIterator {
  currentPluginMap = yield select((state: OverallState) => state.pluginDirectory.pluginMap);
  currentPluginDirectoryUrl = yield select(selectDirectoryPluginUrl);
}

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
  sideContentManager.clearTabs();
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
  const { hostPlugin, csePlugin, conduit } = createConductor(
    evaluatorUrl,
    async (fileName: string) => currentFiles[fileName],
    async (pluginName: string) => {
      if (registry.has(pluginName)) {
        const pluginClass = registry.get(pluginName)!;
        conduit.registerPlugin(pluginClass, sideContentManager);
        return;
      }

      let pluginClassLocation = getWebPluginLocation(pluginName);
      if (!pluginClassLocation) {
        console.warn(`No web plugin resolution found for "${pluginName}" in the plugin directory.`);
        return;
      }
      if (!pluginClassLocation.startsWith('http')) {
        pluginClassLocation = new URL(
          pluginClassLocation,
          currentPluginDirectoryUrl || document.baseURI,
        ).toString();
      }
      await import(/* webpackIgnore: true */ pluginClassLocation)
        .then(tab => tab.default(requireProvider))
        .then(plugin => conduit.registerPlugin(plugin, sideContentManager))
        .catch(error => console.error(`Unable to load external plugin "${pluginName}".`, error));
    },
  );

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

  yield call(updatePluginDirectorySnapshotSaga);
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
  yield call(updatePluginDirectorySnapshotSaga);
  if (options?.workspaceLocation) {
    sideContentManager.setWorkspaceLocation(options.workspaceLocation);
  }
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
