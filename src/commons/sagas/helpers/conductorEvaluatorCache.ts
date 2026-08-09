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
import type { OverallState } from '../../application/ApplicationTypes';
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
  // Set the moment a Run actually uses this instance. evalCode.ts's own run-teardown terminates a
  // consumed conductor's Worker unconditionally right after the run completes, so a consumed
  // instance's conduit must never be handed out again for anything that needs a live one - only its
  // tabs (already on screen) remain valid to reuse. See ensurePreparedConductorSaga.
  consumed: boolean;
};

type GetPreparedConductorOptions = {
  files?: Record<string, string>;
  consume?: boolean;
  workspaceLocation?: SideContentLocation;
};

/**
 * Every conductor ever created for one `selectedLanguageId` ("sublanguage" - Python §1, §2, §3 etc
 * are each their own top-level language-directory entry, distinct from the individual evaluators
 * within them). Switching evaluators within a language (Py2JS <-> PVML <-> the Stepper's own hidden
 * evaluator <-> ...) never discards anything: every conductor created this session coexists, side by
 * side, until the session itself ends. A session ends - and everything in it is torn down, tabs
 * included - only when `selectedLanguageId` actually changes.
 *
 * This replaces the old single `activeConductor`/`pendingTermination` pointer, whose ad-hoc
 * one-switch grace period fixed each reported tab-persistence bug locally but broke the next one:
 * tabs are scoped to the sublanguage, not to whichever conductor happened to be active most recently.
 */
type ConductorSession = {
  readonly languageId: string;
  readonly conductors: PreparedConductor[];
  readonly loading: Map<string, Promise<PreparedConductor>>;
  activeConductor: PreparedConductor | null;
  currentEvaluatorPath: string | null;
};

let currentSession: ConductorSession | null = null;

function* ensureConductorSessionSaga(): SagaIterator<ConductorSession> {
  const languageId: string =
    (yield select((state: OverallState) => state.languageDirectory.selectedLanguageId)) ?? '';
  if (currentSession?.languageId === languageId) {
    return currentSession;
  }
  const previous = currentSession;
  currentSession = {
    languageId,
    conductors: [],
    loading: new Map(),
    activeConductor: null,
    currentEvaluatorPath: null,
  };
  // Swapped in before tearing the old one down, so anything from the old session that resolves
  // late (see ensurePreparedConductorSaga's promise .then()) sees the mismatch immediately instead
  // of racing to adopt itself into the new one.
  if (previous) {
    endConductorSession(previous);
  }
  return currentSession;
}

function endConductorSession(session: ConductorSession): void {
  session.activeConductor = null;
  session.loading.clear();
  for (const conductor of session.conductors.splice(0)) {
    terminatePreparedConductor(conductor);
  }
}

/**
 * Makes `prepared` the sole conductor surfacing tabs in the UI for `session`, deactivating whichever
 * one previously held that role. Unlike the old `activateConductorTabs`, the previous conductor is
 * never terminated here - it stays alive, tabs still visible (`DeferredConductorTabService.deactivate`
 * never hides them - see its own doc comment), until the whole session ends. Guards against `session`
 * having already been superseded (see `ensureConductorSessionSaga`), so a stale reference can't
 * resurrect a dead session's bookkeeping.
 */
function activateConductor(session: ConductorSession, prepared: PreparedConductor): void {
  if (currentSession !== session) {
    return;
  }
  if (session.activeConductor !== prepared) {
    session.activeConductor?.tabService.deactivate();
    session.activeConductor = prepared;
  }
  prepared.tabService.activate();
}

async function fetchEvaluatorObjectUrl(path: string): Promise<string> {
  const evaluatorResponse = await fetch(path);
  if (!evaluatorResponse.ok) {
    throw Error("can't get evaluator");
  }

  const evaluatorBlob = await evaluatorResponse.blob();
  return URL.createObjectURL(evaluatorBlob);
}

/**
 * Frees `conductor`'s Worker/blob/autocomplete-plugin, leaving its tabs registered. Deliberately
 * synchronous, not async - `IConduit.terminate()` is itself synchronous, and the pre-rewrite code's
 * `await` on it only turned a throw into a silently-swallowed unhandled rejection (see
 * `terminatePreparedConductor`'s doc comment). Always safe to call even when evalCode.ts's own
 * run-teardown already terminated this conductor's conduit directly - the ordinary case for any
 * conductor that was ever actually Run - since that just means `conduit.terminate()` throws here,
 * caught and ignored.
 */
function releasePreparedConductor(conductor: PreparedConductor): void {
  // lookupPlugin throws (rather than returning null) when the plugin was never registered on this
  // conductor instance, e.g. if it was cleaned up before the runner ever requested the autocomplete
  // plugin.
  let autocompletePlugin: AutoCompletePlugin | null = null;
  try {
    autocompletePlugin = conductor.conduit.lookupPlugin(WEB_PLUGIN_ID) as AutoCompletePlugin;
  } catch {
    // not registered on this conductor instance; nothing to dispose
  }
  autocompletePlugin?.dispose();
  try {
    conductor.conduit.terminate();
  } catch {
    // already terminated by evalCode.ts's own run teardown - the ordinary case, not exceptional
  }
  URL.revokeObjectURL(conductor.evaluatorUrl);
}

/**
 * Tears `conductor` down completely: unregisters its tabs first, synchronously and unconditionally,
 * then releases its Worker/blob. Tabs must go first - this is the fix for a bug the pre-rewrite code
 * had: its single async `terminatePreparedConductor` awaited `conduit.terminate()` *before*
 * unregistering tabs, but evalCode.ts's own `finally` already terminates every Run's conduit - so for
 * any conductor that had ever been Run, that await threw, and because the whole call was fired via
 * `void terminatePreparedConductor(...)`, the rejection was silently swallowed and
 * `tabService.unregisterAll()` on the next line never ran. Its tabs, and its conduit, leaked for the
 * rest of the session. Splitting the two steps - and making both synchronous - means a throw from the
 * conduit half can no longer prevent the tabs half from running.
 */
function terminatePreparedConductor(conductor: PreparedConductor): void {
  conductor.tabService.unregisterAll();
  releasePreparedConductor(conductor);
}

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

/**
 * Loads a web plugin requested by the runner. The plugin's web-half URL is resolved generically
 * from the plugin directory (`resolutions[WEB]`); after registering it, any side-content tab it
 * exposes is surfaced to the UI. This is plugin-agnostic — no per-plugin code lives here.
 */
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
  const tabService = new DeferredConductorTabService(path);
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
    consumed: false,
    setFiles: (files: Record<string, string>) => {
      currentFiles = files;
    },
  };
}

/**
 * Resolves a conductor for `path` within `session`, preferring reuse over building a new instance:
 *
 * 1. By default, a conductor already on screen for this exact path (`session.activeConductor`) is
 *    returned as-is, even if a Run has already consumed it. Its conduit is never touched by the
 *    caller in that case (see `preloadConductorEvaluatorSaga` - tab/evaluator selection only ever
 *    drives tab display), so reusing it is always safe and avoids rebuilding, and blanking, whatever
 *    the student is currently looking at.
 * 2. Failing that - or when `forceFresh` skips step 1 entirely, because the caller specifically needs
 *    a conduit that's actually alive (see `getPreparedConductorSaga`, used for both an actual Run and
 *    autocomplete requests) - the newest not-yet-consumed instance for this path is reused instead.
 *    This is what makes a post-Run warm spare actually get used by the *next* Run, rather than being
 *    ignored in favour of building yet another one from scratch.
 * 3. Only when neither of the above finds anything is a new conductor actually built.
 */
function* ensurePreparedConductorSaga(
  session: ConductorSession,
  path: string,
  options?: { forceFresh?: boolean },
): SagaIterator<PreparedConductor> {
  if (!options?.forceFresh && session.activeConductor?.path === path) {
    return session.activeConductor;
  }
  for (let i = session.conductors.length - 1; i >= 0; i--) {
    const candidate = session.conductors[i];
    if (candidate.path === path && !candidate.consumed) {
      return candidate;
    }
  }

  const inFlight = session.loading.get(path);
  if (inFlight) {
    return yield call(() => inFlight);
  }

  const moduleDirectory = yield select(selectDirectoryModulesUrl);
  const promise: Promise<PreparedConductor> = createPreparedConductor(path)
    .then(prepared => {
      if (currentSession !== session) {
        // Session ended (language switched) while this was mid-boot - discard rather than adopt it
        // into a session that's already gone.
        terminatePreparedConductor(prepared);
        throw new Error(`conductor session ended while preparing "${path}"`);
      }
      session.conductors.push(prepared);
      // Use this conductor's own instance, not the class's shared static `.instance` - by the time
      // this resolves, a *different* conductor being prepared concurrently elsewhere may already
      // have overwritten it.
      void prepared.moduleLoaderPlugin.onModuleDirectoryURLChange(moduleDirectory);
      return prepared;
    })
    .finally(() => {
      if (session.loading.get(path) === promise) {
        session.loading.delete(path);
      }
    });
  session.loading.set(path, promise);
  return yield call(() => promise);
}

export function* preloadConductorEvaluatorSaga(
  path?: string,
  options?: { forceFresh?: boolean },
): SagaIterator {
  if (!path) {
    return;
  }

  const session: ConductorSession = yield call(ensureConductorSessionSaga);
  // Whether *activation* is still needed for `path`, i.e. whether it isn't already the one whose
  // tabs are surfaced. Deliberately checked against activeConductor (what actually got activated),
  // not currentEvaluatorPath (what was last *requested*, set unconditionally just below regardless
  // of outcome) - otherwise a preload that fails here (e.g. the evaluator fetch itself failing,
  // such as a transient fetch of the plugin/evaluator from an external host) would leave
  // currentEvaluatorPath already pointing at `path`, so every later retry for the very same path
  // (e.g. re-opening the Stepper tab) would see "no change" and skip activateConductor even once
  // preparation finally succeeds - stuck showing the tab's loading placeholder indefinitely, since
  // nothing but a differently-pathed Run (which never consults this flag - see
  // getPreparedConductorSaga) would ever surface it.
  const needsActivation = session.activeConductor?.path !== path;
  session.currentEvaluatorPath = path;

  let prepared: PreparedConductor;
  try {
    prepared = yield call(ensurePreparedConductorSaga, session, path, options);
  } catch (error) {
    // Best-effort preload: if the session has already moved on (a later language switch made this
    // one moot before it finished - see ensurePreparedConductorSaga's own session check), there's
    // nothing left to activate and nothing wrong to report. A real failure (e.g. the evaluator
    // fetch itself failing) while this session is still current is still a genuine problem, so it
    // still propagates - callers like LanguageDirectorySaga already log it.
    if (currentSession !== session) {
      return;
    }
    throw error;
  }

  // Surface the newly-prepared conductor's tabs (e.g. show the Stepper's empty welcome tab on
  // selection) whenever it isn't already the active one. A same-evaluator warm-up spawned after a
  // Run leaves the active conductor untouched, so its populated tab is not replaced by the idle
  // spare.
  if (needsActivation) {
    activateConductor(session, prepared);
  }
}

/**
 * Releases consumed conductors that are no longer contributing anything to `session`: not the
 * currently displayed one, and no longer the current owner of any tab they once forwarded (a newer
 * same-path instance - e.g. the post-Run warm spare - has since taken over). Without this, a session
 * where the same evaluator is Run many times in a row would accumulate dead conductor objects - and
 * their unrevoked evaluator blob URLs - for as long as the session lasts, since `session.conductors`
 * otherwise only ever shrinks when the whole session ends. A not-yet-consumed conductor is never
 * pruned here regardless of activity - it's still a legitimate candidate for reuse (see
 * `ensurePreparedConductorSaga`).
 */
function pruneConsumedConductors(session: ConductorSession): void {
  for (let i = session.conductors.length - 1; i >= 0; i--) {
    const conductor = session.conductors[i];
    if (conductor === session.activeConductor || !conductor.consumed) {
      continue;
    }
    if (conductor.tabService.hasForwardedTabs()) {
      continue;
    }
    session.conductors.splice(i, 1);
    terminatePreparedConductor(conductor);
  }
}

/**
 * Returns a conductor for the current session's selected evaluator path, for either an actual Run
 * (`consume: true`) or an autocomplete request. Both need a conduit that's actually alive, so this
 * always resolves via `ensurePreparedConductorSaga`'s `forceFresh` path rather than whatever's
 * currently displayed — see that function's doc comment for why a displayed conductor isn't
 * necessarily a *live* one (it may already have been consumed by an earlier Run).
 */
export function* getPreparedConductorSaga(options?: GetPreparedConductorOptions): SagaIterator<{
  hostPlugin: BrowserHostPlugin;
  csePlugin: CseMachineHostPlugin;
  conduit: IConduit;
}> {
  const session: ConductorSession = yield call(ensureConductorSessionSaga);
  const path = session.currentEvaluatorPath;
  if (!path) {
    throw Error('no evaluator path selected');
  }
  if (options?.workspaceLocation) {
    sideContentManager.setWorkspaceLocation(options.workspaceLocation);
  }

  const prepared: PreparedConductor = yield call(ensurePreparedConductorSaga, session, path, {
    forceFresh: true,
  });

  if (options?.files) {
    prepared.setFiles(options.files);
  }

  // Consume only when requested (e.g. for program evaluation, not autocomplete requests). Promote
  // this conductor's tabs to the UI so a Run shows the conductor that actually executed.
  const consume = options?.consume ?? false;
  if (consume) {
    prepared.consumed = true;
    activateConductor(session, prepared);
    pruneConsumedConductors(session);
  }

  return {
    hostPlugin: prepared.hostPlugin,
    csePlugin: prepared.csePlugin,
    conduit: prepared.conduit,
  };
}
