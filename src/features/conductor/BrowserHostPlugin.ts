import { BasicHostPlugin } from 'conductor/dist/conductor/host';
import { IChannel, IConduit } from 'conductor/dist/conduit';
import { plugins, PluginType } from 'plugin-directory';
import type React from 'react';
import { TabDefinition } from './TabDefinition';

export class BrowserHostPlugin extends BasicHostPlugin {
  requestFile(fileName: string): Promise<string | undefined> {
    return this.__onRequestFile(fileName);
  }
  requestLoadPlugin(pluginName: string): void {
    if (pluginName in plugins) {
      const location = plugins[pluginName as keyof typeof plugins].resolutions[PluginType.WEB];
      if (location) this.importAndRegisterExternalPlugin(location, this.__createTab);
    }
  }

  private __onRequestFile: (fileName: string) => Promise<string | undefined>;
  private __createTab: (tabDefinition: TabDefinition, tab: React.JSX.Element) => void;

  static readonly channelAttach = super.channelAttach;
  constructor(
    conduit: IConduit,
    channels: IChannel<any>[],
    onRequestFile: (fileName: string) => Promise<string | undefined>,
    createTab: (tabDefinition: TabDefinition, tab: React.JSX.Element) => void
  ) {
    super(conduit, channels);
    this.__onRequestFile = onRequestFile;
    this.__createTab = createTab;
  }
}
