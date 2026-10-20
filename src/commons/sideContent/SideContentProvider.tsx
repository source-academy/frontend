import { useCallback, useSyncExternalStore } from 'react';

import { combineAllTabs, getTabId, useSideContent } from './SideContentHelper';
import sideContentManager from './SideContentManager';
import type {
  ChangeTabsCallback,
  PredefinedTabs,
  SideContentLocation,
  SideContentTab,
  SideContentTabId,
} from './SideContentTypes';

type SideContentProviderProps = {
  tabs?: PredefinedTabs;
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
  const serviceTabs = useSyncExternalStore(sideContentManager.subscribe, () =>
    sideContentManager.getTabs(workspaceLocation),
  );

  const combinedTabs = tabs
    ? combineAllTabs(tabs, dynamicTabs, serviceTabs)
    : [...dynamicTabs, ...serviceTabs];

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
