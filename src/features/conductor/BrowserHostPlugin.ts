// NOTE: Conductor dependency removed, providing stub implementation
// import { BasicHostPlugin } from 'conductor/dist/conductor/host';
// import { IChannel, IConduit } from 'conductor/dist/conduit';

// Stub types
interface IConduit {}
interface IChannel<T> {}
class BasicHostPlugin {
  constructor(conduit: IConduit, channels: IChannel<any>[]) {}
  static channelAttach = () => {};
}

export class BrowserHostPlugin extends BasicHostPlugin {
  receiveOutput?: (output: any) => void;

  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  requestLoadPlugin(pluginName: string): void {
    return this.__onRequestLoadPlugin(pluginName);
  }

  // Stub methods for conductor functionality  
  startEvaluator(entrypointFilePath: string): Promise<void> {
    return Promise.resolve();
  }

  sendChunk(code: string): Promise<void> {
    return Promise.resolve();
  }

  private __onRequestFile: (fileName: string) => Promise<string | undefined>;
  private __onRequestLoadPlugin: (pluginName: string) => void;

  static readonly channelAttach = super.channelAttach;
  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>,
    onRequestLoadPlugin: (pluginName: string) => void
  ) {
    super(conduit, channels);
    this.__onRequestFile = onRequestFile;
    this.__onRequestLoadPlugin = onRequestLoadPlugin;
  }
}
