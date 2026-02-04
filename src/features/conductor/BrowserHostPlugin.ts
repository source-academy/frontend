import { BasicHostPlugin } from '@sourceacademy/conductor/dist/conductor/host';
import { IChannel, IConduit } from '@sourceacademy/conductor/dist/conduit';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  requestLoadPlugin(pluginName: string): void {
    return this.__onRequestLoadPlugin(pluginName);
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
