import type { IconName } from '@blueprintjs/core';

import {
  type SideContentTab,
  SideContentType,
} from '../../commons/sideContent/SideContentTypes';
import type { ConductorPluginTab } from './pluginTabRegistry';

/**
 * Builds a {@link SideContentTab} from a Conductor web plugin's tab descriptor. Generic across
 * plugins: the body is simply the plugin-provided component, so no plugin-specific code is needed.
 */
export function makePluginTabFrom(pluginTab: ConductorPluginTab): SideContentTab {
  const { Component } = pluginTab;
  return {
    label: pluginTab.label,
    iconName: pluginTab.iconName as IconName,
    body: <Component />,
    // Plugin ids are free-form strings; the side-content system keys tabs by this id.
    id: pluginTab.id as SideContentType,
  };
}
