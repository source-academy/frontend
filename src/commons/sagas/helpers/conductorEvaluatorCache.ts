import type { IConduit } from '@sourceacademy/conductor/conduit';
import { PluginType } from '@sourceacademy/plugin-directory';
import { ModuleLoaderWebPlugin } from '@sourceacademy/web-module-loader';
import type { SagaIterator } from 'redux-saga';
import { call, select } from 'redux-saga/effects';
import { selectDirectoryModulesUrl } from 'src/features/directory/flagDirectoryModulesUrl';

import type { BrowserHostPlugin } from '../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../features/conductor/createConductor';
import type { CseMachineHostPlugin } from '../../../features/conductor/CseMachineHostPlugin';
import { DeferredConductorTabService } from '../../../features/conductor/deferredConductorTabService';
import { importAndRegisterWebPlugin } from '../../../features/conductor/importExternalWebPlugin';
import { store } from '../../../pages/createStore';
import sideContentManager from '../../sideContent/SideContentManager';
import type { SideContentLocation } from '../../sideContent/SideContentTypes';

type PreparedConductor = {
  path: string;
  evaluatorUrl: string;
  hostPlugin: BrowserHostPlugin;
  csePlugin: CseMachineHostPlugin;
  conduit: IConduit;
  tabService: DeferredConductorTabService;
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
let activeTabService: DeferredConductorTabService | null = null;

/**
 * Makes `tabService` the sole conductor surfacing tabs in the UI, deactivating the previous one.
 * Only the selected/running conductor shows its tabs; preloaded spares buffer silently until run.
 */
function activateConductorTabs(tabService: DeferredConductorTabService): void {
  if (activeTabService !== tabService) {
    activeTabService?.deactivate();
    activeTabService = tabService;
  }
  tabService.activate();
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
    const url =
      store.getState().pluginDirectory.pluginMap?.[pluginId]?.resolutions?.[PluginType.WEB];
    if (url) return url;
    const moduleUrl = ModuleLoaderWebPlugin.instance?.getModuleTabLocation(pluginId);
    if (moduleUrl) return moduleUrl;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return undefined;
}

async function loadWebPlugin(
  hostPlugin: BrowserHostPlugin | undefined,
  pluginId: string,
  tabService: DeferredConductorTabService,
): Promise<void> {
  if (!hostPlugin) return;
  const url = await resolveWebPluginUrl(pluginId);
  if (!url) {
    console.warn(
      `Conductor: no web resolution for plugin "${pluginId}" (is directory.plugin.url set?)`,
    );
    return;
  }
  try {
    // The plugin is constructed with this conductor's ITabService (third constructor arg), so any
    // side-content tab it exposes registers into that service. The tab is buffered there and only
    // surfaced to the UI while this conductor is the active one (see DeferredConductorTabService).
    await importAndRegisterWebPlugin(hostPlugin, url, tabService);
  } catch (error) {
    console.warn(`Conductor: failed to load web plugin "${pluginId}"`, error);
  }
}

async function createPreparedConductor(path: string): Promise<PreparedConductor> {
  const evaluatorUrl = await fetchEvaluatorObjectUrl(path);

  let currentFiles: Record<string, string> = {};
  let hostPluginRef: BrowserHostPlugin | undefined = undefined;
  const tabService = new DeferredConductorTabService();
  const { hostPlugin, csePlugin, conduit } = createConductor(
    evaluatorUrl,
    async (fileName: string) => currentFiles[fileName],
    (pluginName: string) => {
      void loadWebPlugin(hostPluginRef, pluginName, tabService);
    },
  );
  hostPluginRef = hostPlugin;

  return {
    path,
    evaluatorUrl,
    hostPlugin,
    csePlugin,
    conduit,
    tabService,
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
  const moduleDirectory = yield select(selectDirectoryModulesUrl);

  loadingConductorPath = path;
  loadingConductorPromise = createPreparedConductor(path)
    .then(prepared => {
      preparedConductorPath = path;
      preparedConductor = prepared;
      ModuleLoaderWebPlugin.instance?.onModuleDirectoryURLChange(moduleDirectory);
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

  const evaluatorChanged = currentEvaluatorPath !== path;
  currentEvaluatorPath = path;
  const prepared: PreparedConductor = yield call(ensurePreparedConductorSaga, path);

  // On an evaluator switch, surface the newly-prepared conductor's tabs (e.g. show the Stepper's
  // empty welcome tab on selection). A same-evaluator warm-up spawned after a Run leaves the active
  // conductor untouched, so its populated tab is not replaced by the idle spare.
  if (evaluatorChanged) {
    activateConductorTabs(prepared.tabService);
  }
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
  if (options?.workspaceLocation) {
    sideContentManager.setWorkspaceLocation(options.workspaceLocation);
  }
  const prepared: PreparedConductor = yield call(ensurePreparedConductorSaga, path);
  const files = options?.files;
  const consume = options?.consume ?? false;

  if (files) {
    prepared.setFiles(files);
  }

  // Consume only when requested (e.g. for program evaluation, not autocomplete requests). Promote
  // this conductor's tabs to the UI so a Run shows the conductor that actually executed, and keep
  // them shown while the next (idle) conductor is warmed in the background.
  if (consume) {
    activateConductorTabs(prepared.tabService);
    if (preparedConductor === prepared) {
      resetPreparedConductor();
    }
  }

  return {
    hostPlugin: prepared.hostPlugin,
    csePlugin: prepared.csePlugin,
    conduit: prepared.conduit,
  };
}
