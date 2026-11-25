// Registers a lazy `import()` for every Ace mode, theme, snippet file and extension, so Ace loads
// any of them by id on demand (`session.setMode('ace/mode/ocaml')`, `config.loadModule(id)`). The
// frontend therefore names no language: a language's mode is whatever its evaluator or its
// directory entry says it is.
/* eslint-disable simple-import-sort/imports */

// The resolver refers to the global `ace`, which the Ace build defines: it must be imported first.
import { config, require as acequire } from 'ace-builds/src-noconflict/ace';
import 'ace-builds/esm-resolver';

/** Whether a module (a mode, a folding mode, ...) is already defined. */
export function isAceModuleDefined(id: string): boolean {
  try {
    return !!acequire(id);
  } catch {
    return false;
  }
}

/**
 * Loads the Ace module with the given id, if Ace can: a stock mode such as `ace/mode/python`, but
 * not one that an evaluator defines itself. Resolves to whether the module is now defined.
 */
export function loadAceModule(id: string): Promise<boolean> {
  if (isAceModuleDefined(id)) {
    return Promise.resolve(true);
  }
  if (!(config as unknown as { dynamicModules: Record<string, unknown> }).dynamicModules[id]) {
    return Promise.resolve(false);
  }
  return new Promise(resolve => config.loadModule(id, (module: unknown) => resolve(!!module)));
}

export async function loadAceModules(ids: readonly string[]): Promise<void> {
  await Promise.all(ids.map(loadAceModule));
}
