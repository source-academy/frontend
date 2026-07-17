import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';
import { ModuleLoaderWebPlugin } from '@sourceacademy/web-module-loader';

import AutoCompletePlugin from './AutocompletePlugin';
import { BrowserHostPlugin } from './BrowserHostPlugin';
import { CseMachineHostPlugin } from './CseMachineHostPlugin';

export function createConductor(
  evaluatorPath: string,
  onRequestFile: (fileName: string) => Promise<string | undefined>,
  onRequestLoadPlugin: (pluginName: string) => void,
): {
  hostPlugin: BrowserHostPlugin;
  csePlugin: CseMachineHostPlugin;
  conduit: IConduit;
  moduleLoaderPlugin: ModuleLoaderWebPlugin;
} {
  const worker = new Worker(evaluatorPath);
  const conduit = new Conduit(worker, true);
  const hostPlugin = conduit.registerPlugin(BrowserHostPlugin, onRequestFile, onRequestLoadPlugin);
  hostPlugin.registerPlugin(AutoCompletePlugin);
  const csePlugin = conduit.registerPlugin(CseMachineHostPlugin);
  // Captured directly (rather than read back later via the class's static `.instance`, which is
  // shared page-wide and gets overwritten by every new conductor - including a warm spare prepared
  // in the background while this one is still actively running a script) so callers always resolve
  // modules against *this* conductor's own instance, not whichever one was constructed most recently.
  const moduleLoaderPlugin = hostPlugin.registerPlugin(ModuleLoaderWebPlugin);
  return { hostPlugin, csePlugin, conduit, moduleLoaderPlugin };
}
