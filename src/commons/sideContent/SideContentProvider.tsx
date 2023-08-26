import { useSideContentInternal } from './SideContentHelper';
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
  defaultTab?: SideContentType;
} & SideContentLocation;

export default function SideContentProvider({
  tabs,
  defaultTab,
  children,
  ...props
}: SideContentProviderProps) {
  const { alerts, height, dynamicTabs, setSelectedTab, selectedTab } = useSideContentInternal(
    props,
    defaultTab
  );

  const allTabs = tabs
    ? [...tabs.beforeDynamicTabs, ...dynamicTabs, ...tabs.afterDynamicTabs]
    : dynamicTabs;

  const changeTabsCallback: ChangeTabsCallback = (newId, oldId, event) => {
    if (props.onChange) {
      // Controlled mode
      props.onChange(newId, oldId, event);
    } else {
      // Uncontrolled mode
      setSelectedTab(newId);
    }
  };

  return children({
    tabs: allTabs,
    alerts,
    changeTabsCallback,
    selectedTab: props.selectedTab ? props.selectedTab : selectedTab,
    height
  });
}
