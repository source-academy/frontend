import type { ITabService } from '@sourceacademy/common-tabs';
import type { PluginClass } from '@sourceacademy/conductor/conduit';
import { requireProvider } from 'src/commons/sideContent/SideContentHelper';

import type { BrowserHostPlugin } from './BrowserHostPlugin';
type PluginExports = { plugin?: unknown; default?: unknown };

/**
 * Resolves the plugin class from an imported web-plugin bundle, supporting two shapes:
 *
 *  1. a named `plugin` export — Conductor's own {@link importExternalPlugin} contract; or
 *  2. a `default` require-wrapper `(require) => moduleExports` — the format emitted by the plugins
 *     repo build. It is an arrow function (no `prototype`), so we invoke it with the host `require`
 *     to obtain `module.exports`, then read the plugin class off it.
 */
function resolvePluginClass(moduleNamespace: PluginExports): unknown {
  if (typeof moduleNamespace.plugin === 'function') {
    return moduleNamespace.plugin;
  }

  const defaultExport = moduleNamespace.default;
  if (typeof defaultExport !== 'function') {
    return undefined;
  }

  // A require-wrapper is an arrow function, which has no `prototype`; a default-exported plugin
  // class does. Only the former needs to be invoked with the host `require`.
  if ((defaultExport as { prototype?: unknown }).prototype !== undefined) {
    return defaultExport;
  }

  const exported = (defaultExport as (require: typeof requireProvider) => PluginExports)(
    requireProvider,
  );
  return exported?.plugin ?? exported?.default ?? exported;
}

/**
 * Imports a Conductor web plugin bundle from `url` and registers it with the host, passing the
 * shared {@link ITabService} as a constructor argument so the plugin can contribute side-content
 * tabs. This is the host-side counterpart to Conductor's `importAndRegisterExternalPlugin`, which
 * only understands a named `plugin` export and cannot inject the host's React/Blueprint that the
 * require-wrapper bundles depend on.
 */
export async function importAndRegisterWebPlugin(
  hostPlugin: BrowserHostPlugin,
  url: string,
  tabService: ITabService,
): Promise<void> {
  const moduleNamespace: PluginExports = await import(/* webpackIgnore: true */ url);
  const pluginClass = resolvePluginClass(moduleNamespace);
  if (typeof pluginClass !== 'function') {
    throw new Error(`Conductor web plugin at "${url}" did not export a plugin class`);
  }
  hostPlugin.registerPlugin(pluginClass as PluginClass<[ITabService]>, tabService);
}
