import { ModulesGlobalConfig as CCompilerConfig } from '@sourceacademy/c-slang/ctowasm/dist';
import { initModuleContext, loadModuleBundle } from 'js-slang/dist/modules/loader/moduleLoader';
import { ModuleFunctions } from 'js-slang/dist/modules/moduleTypes';
import { Context } from 'js-slang/dist/types';

import { handleConsoleLog } from '../application/actions/InterpreterActions';

export async function makeCCompilerConfig(
  program: string,
  context: Context
): Promise<CCompilerConfig> {
  const externalFunctions = await loadModulesUsedInCProgram(program, context);
  return {
    printFunction: (v: string) => {
      if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
        (window as any).__REDUX_STORE__.dispatch(handleConsoleLog(context.externalContext, v));
      }
    },
    externalFunctions
  };
}

const modulesAvailableForC = new Set(['pix_n_flix']);

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
  for (const m of includedModules) {
    const moduleName = m.slice(1, m.length - 1);

    if (modulesAvailableForC.has(moduleName)) {
      await initModuleContext(moduleName, context, true);
      const moduleFuncs = await loadModuleBundle(moduleName, context);
      for (const moduleFunc of Object.keys(moduleFuncs)) {
        allModuleFunctions[moduleFunc] = moduleFuncs[moduleFunc];
      }
    }
  }
  const pixNFlixStart = allModuleFunctions['start'];
  allModuleFunctions['start'] = () => {
    specialCReturnObject = pixNFlixStart();
  };
  return allModuleFunctions;
}
