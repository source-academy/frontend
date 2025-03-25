import { Conduit, IConduit } from 'conductor/dist/conduit';

import { BrowserHostPlugin } from './BrowserHostPlugin';
import { TabDefinition } from './TabDefinition';

export function createConductor(
  evaluatorPath: string,
  onRequestFile: (fileName: string) => Promise<string | undefined>,
  createTab: (tabDefinition: TabDefinition, tab: React.JSX.Element) => void
): { hostPlugin: BrowserHostPlugin; conduit: IConduit } {
  const worker = new Worker(evaluatorPath);
  const conduit = new Conduit(worker, true);
  const hostPlugin = conduit.registerPlugin(BrowserHostPlugin, onRequestFile, createTab);
  return { hostPlugin, conduit };
}
