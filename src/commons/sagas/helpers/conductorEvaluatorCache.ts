import { WEB_PLUGIN_ID } from '@sourceacademy/common-autocomplete';
import type { IConduit } from '@sourceacademy/conductor/conduit';
import { PluginType } from '@sourceacademy/plugin-directory';
import { ModuleLoaderWebPlugin } from '@sourceacademy/web-module-loader';
import type { SagaIterator } from 'redux-saga';
import { call, select } from 'redux-saga/effects';
import { selectDirectoryModulesUrl } from 'src/features/directory/flagDirectoryModulesUrl';
import { selectDirectoryPluginUrl } from 'src/features/directory/flagDirectoryPluginUrl';

import { associateAutocompleteEvaluator } from '../../../features/conductor/autocompleteModeStore';
import type AutoCompletePlugin from '../../../features/conductor/AutocompletePlugin';
import type { BrowserHostPlugin } from '../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../features/conductor/createConductor';
import type { CseMachineHostPlugin } from '../../../features/conductor/CseMachineHostPlugin';
import { DeferredConductorTabService } from '../../../features/conductor/deferredConductorTabService';
import { importAndRegisterWebPlugin } from '../../../features/conductor/importExternalWebPlugin';
import { registry } from '../../../features/conductor/Registry';
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
  moduleLoaderPlugin: ModuleLoaderWebPlugin;
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

  // lookupPlugin throws (rather than returning null) when the plugin was never registered on
  // this conductor instance, e.g. if it was cleaned up before the runner ever requested the
  // autocomplete plugin.
  let autocompletePlugin: AutoCompletePlugin | null = null;
  try {
    autocompletePlugin = conductor.conduit.lookupPlugin(WEB_PLUGIN_ID) as AutoCompletePlugin;
  } catch {
    // not registered on this conductor instance; nothing to dispose
  }
  autocompletePlugin?.dispose();
  await conductor.conduit.terminate();
  // Precise, not a blanket clear: a preloaded-but-never-activated spare never touched
  // sideContentManager in the first place (see DeferredConductorTabService), so this only ever
  // removes tabs this conductor itself registered, leaving any other conductor's tabs alone. By the
  // time this runs, the conductor being terminated is never the active one either — see the guard in
  // cleanupPreparedConductorSaga below — so in practice this is cleaning up an unused spare.
  conductor.tabService.unregisterAll();
  URL.revokeObjectURL(conductor.evaluatorUrl);
}

function resetPreparedConductor() {
  preparedConductorPath = null;
  preparedConductor = null;
}

function* cleanupPreparedConductorSaga(): SagaIterator {
  const conductorToTerminate = preparedConductor;
  resetPreparedConductor();
  // The conductor sitting in the "prepared" slot may also be the one currently active/displayed —
  // this happens whenever an evaluator has been selected/previewed but never actually Run (a real
  // Run's `consume` branch below is what normally decouples the two once it happens). Don't terminate
  // it just because a *different* evaluator is now being prepared: it's still legitimately in use, and
  // tearing it down would take its tabs (e.g. Data Visualizer) down with it via unregisterAll, even
  // though nothing about it actually changed. Forgetting it via resetPreparedConductor above is
  // already enough — the next ensurePreparedConductorSaga call for its own path will no longer find it
  // cached and will prepare a fresh one, same end state as if it had been terminated here.
  if (conductorToTerminate?.tabService === activeTabService) {
    return;
  }
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
async function resolveWebPluginUrl(
  pluginId: string,
  moduleLoaderPlugin: ModuleLoaderWebPlugin,
): Promise<string | undefined> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const url =
      store.getState().pluginDirectory.pluginMap?.[pluginId]?.resolutions?.[PluginType.WEB];
    if (url) {
      // Resolutions are relative to the plugin directory's own URL (e.g. "./web/stepper/index.mjs"
      // relative to .../plugins/directory.json), not to wherever this bundle happens to be served
      // from. A bare relative string handed to import() resolves against the importing module's own
      // URL instead, silently 404ing (or worse, resolving to an unrelated same-origin path) - resolve
      // it against the directory's URL explicitly so import() always gets an absolute URL.
      return new URL(url, selectDirectoryPluginUrl(store.getState())).href;
    }
    const moduleUrl = moduleLoaderPlugin.getModuleTabLocation(pluginId);
    if (moduleUrl) {
      return moduleUrl;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return undefined;
}

async function loadWebPlugin(
  hostPlugin: BrowserHostPlugin | undefined,
  pluginId: string,
  tabService: DeferredConductorTabService,
  moduleLoaderPlugin: ModuleLoaderWebPlugin,
  evaluatorPath: string,
): Promise<void> {
  if (!hostPlugin) {
    return;
  }
  const builtInPlugin = registry.get(pluginId);
  if (builtInPlugin) {
    if (pluginId === WEB_PLUGIN_ID) {
      associateAutocompleteEvaluator(tabService, evaluatorPath);
    }
    hostPlugin.registerPlugin(builtInPlugin, tabService);
    return;
  }
  const url = await resolveWebPluginUrl(pluginId, moduleLoaderPlugin);
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
  const { hostPlugin, csePlugin, conduit, moduleLoaderPlugin } = createConductor(
    evaluatorUrl,
    async (fileName: string) => currentFiles[fileName],
    (pluginName: string) =>
      loadWebPlugin(hostPluginRef, pluginName, tabService, moduleLoaderPlugin, path),
  );
  hostPluginRef = hostPlugin;

  return {
    path,
    evaluatorUrl,
    hostPlugin,
    csePlugin,
    conduit,
    tabService,
    moduleLoaderPlugin,
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
      // Use this conductor's own instance, not the class's shared static `.instance` - by the time
      // this resolves, a *different* conductor being prepared concurrently elsewhere may already
      // have overwritten it.
      void prepared.moduleLoaderPlugin.onModuleDirectoryURLChange(moduleDirectory);
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
