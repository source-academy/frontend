import * as BlueprintCore from '@blueprintjs/core';
import type { PluginClass } from '@sourceacademy/conductor/conduit';
import React from 'react';
import * as ReactJsxRuntime from 'react/jsx-runtime';

import type { BrowserHostPlugin } from './BrowserHostPlugin';
import type { ITabService } from './commonTabs';

/**
 * Modules the host exposes to Conductor web plugins through their `require` shim. Web plugins are
 * built with React/Blueprint as externals so they reuse the host's singletons (a second React copy
 * would break hooks and make the plugin's elements incompatible with the host renderer). The host
 * owns these deps, which keeps plugins lightweight and free of per-plugin frontend wiring.
 */
const HOST_PROVIDED_MODULES: Record<string, unknown> = {
  react: React,
  'react/jsx-runtime': ReactJsxRuntime,
  '@blueprintjs/core': BlueprintCore,
};

function hostRequire(moduleName: string): unknown {
  const resolved = HOST_PROVIDED_MODULES[moduleName];
  if (resolved === undefined) {
    throw new Error(`Conductor web plugin require()'d an unavailable module: "${moduleName}"`);
  }
  return resolved;
}

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

  const exported = (defaultExport as (require: typeof hostRequire) => PluginExports)(hostRequire);
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
