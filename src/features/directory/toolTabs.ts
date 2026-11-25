import type { IPluginDefinition, IPluginTab } from '@sourceacademy/plugin-directory/dist/types';

import type { SideContentTabId } from '../../commons/sideContent/SideContentTypes';

/**
 * Tabs that belong to an evaluator, as the two directories describe them. An evaluator names a
 * `plugin` (language directory), and that plugin describes its tab (plugin directory), so the frontend
 * names neither the tool nor its tab.
 */
type PluginMap = Readonly<Record<string, IPluginDefinition>>;

export type ToolTab = {
  /** What the plugin directory says about the tab: id, label, icon and behaviour. */
  readonly tab: IPluginTab;
  /** The evaluator that opening the tab selects. */
  readonly evaluatorId: string;
};

/**
 * The tabs that the given evaluators bring, one for each evaluator that names a plugin whose
 * directory entry describes a tab. Nothing for a plugin that is not in the directory (yet).
 */
export function toolTabsOf(
  evaluators: readonly { id: string; plugin?: string }[],
  pluginMap: PluginMap,
): ToolTab[] {
  return evaluators.flatMap(({ id, plugin }) => {
    const tab = plugin ? pluginMap[plugin]?.tab : undefined;
    return tab ? [{ tab, evaluatorId: id }] : [];
  });
}

/**
 * How a tab affects the workspace around it, from the plugin directory: whether the REPL is hidden
 * while it is selected and whether the side content can be resized then. A tab that no plugin in the
 * directory describes (the editor's own, a module's) gets the defaults.
 */
export function tabBehaviour(
  pluginMap: PluginMap,
  tabId: SideContentTabId | undefined,
): { hidesRepl: boolean; resizable: boolean } {
  const tab =
    tabId === undefined
      ? undefined
      : Object.values(pluginMap).find(plugin => plugin.tab?.id === tabId)?.tab;
  return { hidesRepl: tab?.hidesRepl ?? false, resizable: tab?.resizable ?? true };
}
