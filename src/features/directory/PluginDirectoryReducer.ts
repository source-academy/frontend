import { createReducer, type Reducer } from '@reduxjs/toolkit';
import { generatePluginMap } from '@sourceacademy/plugin-directory/dist/util';

import { defaultPluginDirectory } from '../../commons/application/ApplicationTypes';
import type { SourceActionType } from '../../commons/utils/ActionsHelper';
import Actions from './PluginDirectoryActions';
import { PluginDirectoryState } from './PluginDirectoryTypes';

export const PluginDirectoryReducer: Reducer<PluginDirectoryState, SourceActionType> =
  createReducer(defaultPluginDirectory, builder => {
    builder.addCase(Actions.setPlugins, (state, action) => {
      state.plugins = action.payload.plugins;
      state.pluginMap = Object.fromEntries(generatePluginMap(action.payload.plugins));
    });
  });
