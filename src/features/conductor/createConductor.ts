import { Conduit, IConduit } from '@sourceacademy/conductor/dist/conduit';

import { BrowserHostPlugin } from './BrowserHostPlugin';

export function createConductor(
  evaluatorPath: string,
  onRequestFile: (fileName: string) => Promise<string | undefined>,
  onRequestLoadPlugin: (pluginName: string) => void
): { hostPlugin: BrowserHostPlugin; conduit: IConduit } {
  const worker = new Worker(evaluatorPath);
  const conduit = new Conduit(worker, true);
  const hostPlugin = conduit.registerPlugin(BrowserHostPlugin, onRequestFile, onRequestLoadPlugin);
  return { hostPlugin, conduit };
}
