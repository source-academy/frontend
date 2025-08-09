// NOTE: Conductor dependency removed, providing stub implementation
// import { Conduit, IConduit } from 'conductor/dist/conduit';

import { BrowserHostPlugin } from './BrowserHostPlugin';

// Stub types
interface IConduit {
  registerPlugin: (plugin: any, ...args: any[]) => BrowserHostPlugin;
  terminate: () => void;
}
class Conduit implements IConduit {
  constructor(worker: Worker, flag: boolean) {}
  registerPlugin(plugin: any, ...args: any[]): BrowserHostPlugin {
    return new plugin(this, [], ...args);
  }
  terminate() {
    // Stub implementation
  }
}

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
