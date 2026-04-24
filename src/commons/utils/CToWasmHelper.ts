import type { ModulesGlobalConfig as CCompilerConfig } from '@sourceacademy/c-slang/ctowasm/dist';
import loadSourceModules, { memoizedGetModuleManifestAsync } from 'js-slang/dist/modules/loader';
import type { ModuleInfo } from 'js-slang/dist/modules/moduleTypes';
import type { Context } from 'js-slang/dist/types';

import InterpreterActions from '../application/actions/InterpreterActions';

type ModuleFunctions = Record<string, any>;

export async function makeCCompilerConfig(
  program: string,
  context: Context
): Promise<CCompilerConfig> {
  const externalFunctions = await loadModulesUsedInCProgram(program, context);
  return {
    printFunction: (v: string) => {
      if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
        (window as any).__REDUX_STORE__.dispatch(
          InterpreterActions.handleConsoleLog(context.externalContext, v)
        );
      }
    },
    externalFunctions
  };
}

const modulesAvailableForC = new Set(['pix_n_flix', 'sound', 'plotly']);

export let specialCReturnObject: any = null;

/**
 * Load all the modules used in C Program
 */
export async function loadModulesUsedInCProgram(
  program: string,
  context: Context
): Promise<ModuleFunctions> {
  const allModuleFunctions: ModuleFunctions = {};
  const regexp = /<[a-z0-9_]+>/g;
  const includedModules = program.match(regexp);
  if (!includedModules) {
    return allModuleFunctions;
  }

  const modulesToLoad = new Set(
    includedModules.map(m => m.slice(1, m.length - 1)).filter(m => modulesAvailableForC.has(m))
  );

  const manifest = await memoizedGetModuleManifestAsync();
  const sourceModulesToImport: Record<string, ModuleInfo> = {};
  for (const name of modulesToLoad) {
    if (!manifest[name]) {
      throw new Error(`Module "${name}" not found in the Source modules manifest.`);
    }
    sourceModulesToImport[name] = { name, ...manifest[name] };
  }
  const loadedModules = await loadSourceModules(sourceModulesToImport, context, {
    loadTabs: true
  });
  Object.values(loadedModules).forEach(functions => {
    Object.entries(functions).forEach(([name, func]) => {
      allModuleFunctions[name] = func;
    });
  });

  const pixNFlixStart = allModuleFunctions['start'];
  allModuleFunctions['start'] = () => {
    specialCReturnObject = pixNFlixStart();
  };
  return allModuleFunctions;
}
