import { BasicHostPlugin } from 'conductor/dist/conductor/host';
import { IChannel, IConduit } from 'conductor/dist/conduit';
import { plugins, PluginType } from 'plugin-directory';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  requestLoadPlugin(pluginName: string): void {
    if (pluginName in plugins) {
      const location = plugins[pluginName as keyof typeof plugins].resolutions[PluginType.WEB];
      if (location) this.importAndRegisterExternalPlugin(location);
    }
  }

  private __onRequestFile: (fileName: string) => Promise<string | undefined>;

  static readonly channelAttach = super.channelAttach;
  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>
  ) {
    super(conduit, channels);
    this.__onRequestFile = onRequestFile;
  }
}
