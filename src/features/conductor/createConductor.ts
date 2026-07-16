import type { IConduit } from '@sourceacademy/conductor/conduit';
import { Conduit } from '@sourceacademy/conductor/conduit';

import AutoCompletePlugin from './AutocompletePlugin';
import { BrowserHostPlugin } from './BrowserHostPlugin';
import { CseMachineHostPlugin } from './CseMachineHostPlugin';

export function createConductor(
  evaluatorPath: string,
  onRequestFile: (fileName: string) => Promise<string | undefined>,
  onRequestLoadPlugin: (pluginName: string) => void,
): { hostPlugin: BrowserHostPlugin; csePlugin: CseMachineHostPlugin; conduit: IConduit } {
  const worker = new Worker(evaluatorPath);
  const conduit = new Conduit(worker, true);
  const hostPlugin = conduit.registerPlugin(BrowserHostPlugin, onRequestFile, onRequestLoadPlugin);
  hostPlugin.registerPlugin(AutoCompletePlugin);
  const csePlugin = conduit.registerPlugin(CseMachineHostPlugin);
  return { hostPlugin, csePlugin, conduit };
}
