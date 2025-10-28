import { IPluginDefinition } from '@sourceacademy/plugin-directory/dist/types';

export type PluginDirectoryState = {
  readonly plugins: IPluginDefinition[];
  readonly pluginMap: Record<string, IPluginDefinition>;
};
