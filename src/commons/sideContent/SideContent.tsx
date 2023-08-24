import { Card, Icon, Tab, TabId, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { assertType } from '../utils/TypeHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { generateTabAlert, getTabId } from './SideContentHelper';
import SideContentProvider from './SideContentProvider';
import type { ChangeTabsCallback, SideContentLocation, SideContentTab } from './SideContentTypes';

export type SideContentProps = {
  renderActiveTabPanelOnly?: boolean;
  editorWidth?: string;
  selectedTabId?: TabId;
  tabs?: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  onChange: ChangeTabsCallback;
} & SideContentLocation;

const renderTab = (
  tab: SideContentTab,
  shouldAlert: boolean,
  workspaceLocation?: WorkspaceLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const iconSize = 20;
  const tabId = getTabId(tab);
  const tabTitle = (
    <Tooltip2 content={tab.label}>
      <div className={generateTabAlert(shouldAlert)}>
        <Icon icon={tab.iconName} iconSize={iconSize} />
      </div>
    </Tooltip2>
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

const SideContent = ({
  renderActiveTabPanelOnly,
  selectedTabId,
  editorWidth,
  ...props
}: SideContentProps) => (
  <SideContentProvider {...props}>
    {(allTabs, tabAlerts, changeTabsCallback, height) => (
      <div className="side-content">
        <Card>
          <div className="side-content-tabs">
            <Tabs
              id="side-content-tabs"
              onChange={changeTabsCallback}
              renderActiveTabPanelOnly={renderActiveTabPanelOnly}
              selectedTabId={selectedTabId}
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
