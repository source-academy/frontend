import type { IChannel, IConduit } from '@sourceacademy/conductor/conduit';
import { BasicHostPlugin } from '@sourceacademy/conductor/host';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  async requestLoadPlugin(pluginName: string): Promise<void> {
    await this.__onRequestLoadPlugin(pluginName);
  }
  queryPluginResolutions(pluginId: string): Record<string, string> {
    // Fallback identity resolution; host can still load explicit plugin URLs/IDs.
    return { [pluginId]: pluginId };
  }
  receiveResult?(result: any): void;

  private __onRequestFile: (fileName: string) => Promise<string | undefined>;
  private __onRequestLoadPlugin: (pluginName: string) => Promise<void>;

  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>,
    onRequestLoadPlugin: (pluginName: string) => Promise<void>,
  ) {
    super(conduit, channels);
    this.__onRequestFile = onRequestFile;
    this.__onRequestLoadPlugin = onRequestLoadPlugin;
  }
}
