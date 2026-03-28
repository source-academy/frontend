import type { IChannel, IConduit } from '@sourceacademy/conductor/conduit';
import { BasicHostPlugin } from '@sourceacademy/conductor/host';
import type { IResultMessage } from '@sourceacademy/conductor/types';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  requestLoadPlugin(pluginName: string): void {
    return this.__onRequestLoadPlugin(pluginName);
  }
  queryPluginResolutions(pluginId: string): Record<string, string> {
    // Fallback identity resolution; host can still load explicit plugin URLs/IDs.
    return { [pluginId]: pluginId };
  }
  receiveResult?(result: any): void;

  private __onRequestFile: (fileName: string) => Promise<string | undefined>;
  private __onRequestLoadPlugin: (pluginName: string) => void;

  static readonly channelAttach = [...super.channelAttach, '__result'] as any;
  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>,
    onRequestLoadPlugin: (pluginName: string) => void
  ) {
    super(conduit, channels);
    this.__onRequestFile = onRequestFile;
    this.__onRequestLoadPlugin = onRequestLoadPlugin;
    const resultChannel = channels.find(
      (channel): channel is IChannel<IResultMessage> => channel.name === '__result'
    );
    resultChannel?.subscribe(resultMessage => this.receiveResult?.(resultMessage.result));
  }
}
