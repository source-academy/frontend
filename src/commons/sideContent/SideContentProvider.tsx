import { useCallback } from 'react';

import { useSideContent } from './SideContentHelper';
import type {
  ChangeTabsCallback,
  SideContentLocation,
  SideContentTab,
  SideContentType
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
    selectedTab?: SideContentType;
  }) => JSX.Element;

  /**
   * Providing this prop changes the side content provider to uncontrolled mode. The user is
   * then responsible for managing tab changing
   */
  onChange?: ChangeTabsCallback;
  selectedTab?: SideContentType;

  /**
   * Value to use if the currently selected tab is undefined
   */
  defaultTab?: SideContentType;
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
  workspaceLocation
}: SideContentProviderProps) {
  const { alerts, height, dynamicTabs, setSelectedTab, selectedTab } = useSideContent(
    workspaceLocation,
    defaultTab
  );

  const allTabs = tabs
    ? [...tabs.beforeDynamicTabs, ...dynamicTabs, ...tabs.afterDynamicTabs]
    : dynamicTabs;

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
    [onChange, setSelectedTab]
  );

  return children({
    tabs: allTabs,
    alerts,
    changeTabsCallback,
    selectedTab: propsSelectedTab ?? selectedTab,
    height
  });
}
