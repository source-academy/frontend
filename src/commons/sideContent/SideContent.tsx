import { Card, Icon, Tab, TabProps, Tabs, Tooltip } from '@blueprintjs/core';

import { assertType } from '../utils/TypeHelper';
import { generateTabAlert, getTabId } from './SideContentHelper';
import SideContentProvider from './SideContentProvider';
import type {
  ChangeTabsCallback,
  SideContentLocation,
  SideContentTab,
  SideContentType
} from './SideContentTypes';

export type SideContentProps = {
  renderActiveTabPanelOnly?: boolean;
  editorWidth?: string;
  tabs?: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  onChange?: ChangeTabsCallback;
  selectedTabId?: SideContentType;
  defaultTab?: SideContentType;
  workspaceLocation: SideContentLocation;
};

const renderTab = (
  tab: SideContentTab,
  shouldAlert: boolean,
  workspaceLocation?: SideContentLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const iconSize = 20;
  const tabId = getTabId(tab);
  const tabTitle = (
    <Tooltip content={tab.label}>
      <div className={generateTabAlert(shouldAlert)}>
        <Icon icon={tab.iconName} size={iconSize} />
      </div>
    </Tooltip>
  );
  const tabProps = assertType<TabProps>()({
    id: tabId,
    title: tabTitle,
    disabled: tab.disabled,
    className: 'side-content-tab'
  });

  if (!tab.body) {
    return <Tab key={tabId} {...tabProps} />;
  }

  const tabBody: JSX.Element = workspaceLocation
    ? {
        ...tab.body,
        props: {
          ...tab.body.props,
          workspaceLocation,
          editorWidth,
          sideContentHeight
        }
      }
    : tab.body;
  const tabPanel: JSX.Element = <div className="side-content-text">{tabBody}</div>;

  return <Tab key={tabId} {...tabProps} panel={tabPanel} />;
};

const SideContent = ({ renderActiveTabPanelOnly, editorWidth, ...props }: SideContentProps) => (
  <SideContentProvider {...props}>
    {({ tabs: allTabs, alerts: tabAlerts, changeTabsCallback, selectedTab, height }) => (
      <div className="side-content">
        <Card>
          <div className="side-content-tabs">
            <Tabs
              id="side-content-tabs"
              onChange={changeTabsCallback}
              renderActiveTabPanelOnly={renderActiveTabPanelOnly}
              selectedTabId={selectedTab}
            >
              {allTabs.map(tab => {
                const tabId = getTabId(tab);
                return renderTab(
                  tab,
                  tabAlerts.includes(tabId),
                  props.workspaceLocation,
                  editorWidth,
                  height
                );
              })}
            </Tabs>
          </div>
        </Card>
      </div>
    )}
  </SideContentProvider>
);

export default SideContent;
