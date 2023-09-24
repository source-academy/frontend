import { SideContentLocation } from "../redux/workspace/WorkspaceReduxTypes"
import { useSideContent } from "./SideContentHelper"
import { ChangeTabsCallback, SideContentTab, SideContentType } from "./SideContentTypes"


export type SideContentProviderProps = {
  location: SideContentLocation
  tabs?: {
    beforeDynamicTabs: SideContentTab[]
    afterDynamicTabs: SideContentTab[]
  }
  defaultTab?: SideContentType
  onChange?: ChangeTabsCallback
  children: (allTabs: SideContentTab[], changeTabsCallback: ChangeTabsCallback, alerts: string[], selectedTabId?: SideContentType, height?: number) => JSX.Element
}

export const SideContentProvider = (props: SideContentProviderProps) => {
  const sideContent = useSideContent(props.location, props.defaultTab)
  const allTabs = props.tabs ? [
    ...props.tabs.beforeDynamicTabs,
    ...sideContent.dynamicTabs,
    ...props.tabs.afterDynamicTabs
  ] : sideContent.dynamicTabs
  
  return props.children(allTabs, props.onChange ?? sideContent.setSelectedTab, sideContent.alerts, sideContent.selectedTab, sideContent.height)

}
