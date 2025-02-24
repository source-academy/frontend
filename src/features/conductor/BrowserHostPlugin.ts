import { BasicHostPlugin } from 'conductor/dist/conductor/host';
import { IChannel, IConduit } from 'conductor/dist/conduit';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile: (fileName: string) => Promise<string | undefined>;
  requestLoadPlugin: (pluginName: string) => void;

  static readonly channelAttach = super.channelAttach;
  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>,
    onRequestLoadPlugin: (pluginName: string) => void
  ) {
    super(conduit, channels);
    this.requestFile = onRequestFile;
    this.requestLoadPlugin = onRequestLoadPlugin;
  }
}
