import { IPluginDefinition } from '@sourceacademy/plugin-directory/dist/types';

import { createActions } from '../../commons/redux/utils';

const PluginDirectoryActions = createActions('directory/plugins', {
  /** Fetch plugins (saga) */
  fetchPlugins: null,
  /** Set plugins list */
  setPlugins: (plugins: IPluginDefinition[]) => ({ plugins })
});

export default PluginDirectoryActions;
