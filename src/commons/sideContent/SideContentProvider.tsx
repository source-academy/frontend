import { useCallback, useSyncExternalStore } from 'react';

import { getTabId, useSideContent } from './SideContentHelper';
import sideContentManager from './SideContentManager';
import type {
  ChangeTabsCallback,
  SideContentLocation,
  SideContentTab,
  SideContentTabId,
} from './SideContentTypes';

type SideContentProviderProps = {
  tabs?: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  children: (args: {
    tabs: SideContentTab[];
    alerts: string[];
    changeTabsCallback: ChangeTabsCallback;
    height?: number;
    selectedTab?: SideContentTabId;
  }) => React.ReactElement;

  /**
   * Providing this prop changes the side content provider to uncontrolled mode. The user is
   * then responsible for managing tab changing
   */
  onChange?: ChangeTabsCallback;
  selectedTab?: SideContentTabId;

  /**
   * Value to use if the currently selected tab is undefined
   */
  defaultTab?: SideContentTabId;
  workspaceLocation: SideContentLocation;
};

/**
 * Component that connects its child SideContentComponent to the Redux store, automatically
 * providing SideContentHeight information.
 *
 * If the `onChange` prop is specified, the component enters controlled mode, and the user
 * is responsible for handling the `onChange` event, as well as providing the `selectedTab`
 *
 * If not, the component, will automatically handle dispatching events to the Redux store
 */
export default function SideContentProvider({
  tabs,
  defaultTab,
  children,
  onChange,
  selectedTab: propsSelectedTab,
  workspaceLocation,
}: SideContentProviderProps) {
  const { alerts, height, dynamicTabs, setSelectedTab, selectedTab } = useSideContent(
    workspaceLocation,
    defaultTab,
  );
  const serviceTabs = useSyncExternalStore(
    sideContentManager.subscribe,
    () => sideContentManager.getTabs(workspaceLocation),
  );

  const combinedTabs = tabs
    ? [...tabs.beforeDynamicTabs, ...dynamicTabs, ...serviceTabs, ...tabs.afterDynamicTabs]
    : [...dynamicTabs, ...serviceTabs];

  // De-duplicate by rendered tab id (the same key React/Blueprint use), keeping the first occurrence.
  // A statically-provided tab may share an id with a dynamically-registered service tab — e.g. the
  // Stepper tab, which the Playground provides as a placeholder so it is always visible for a stepping
  // language, while the conductor's web plugin registers the live one once its evaluator is selected.
  // Ordering the service tabs before the placeholder lets the live tab win in the same slot, so the
  // tab neither disappears nor duplicates as the evaluator loads.
  const seenTabIds = new Set<string>();
  const allTabs = combinedTabs.filter(tab => {
    const id = getTabId(tab);
    if (seenTabIds.has(id)) {
      return false;
    }
    seenTabIds.add(id);
    return true;
  });

  const changeTabsCallback: ChangeTabsCallback = useCallback(
    (newId, oldId, event) => {
      if (onChange) {
        // Controlled mode
        onChange(newId, oldId, event);
      } else {
        // Uncontrolled mode
        setSelectedTab(newId);
      }
    },
    [onChange, setSelectedTab],
  );

  return children({
    tabs: allTabs,
    alerts,
    changeTabsCallback,
    selectedTab: propsSelectedTab ?? selectedTab,
    height,
  });
}
