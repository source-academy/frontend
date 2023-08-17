import { Card, Icon, Tab, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import GenericSideContent, {
  generateIconId,
  GenericSideContentProps
} from '../../../commons/sideContent/GenericSideContent';
import { SideContentTab, SideContentType } from '../../../commons/sideContent/SideContentTypes';
import { propsAreEqual } from '../../../commons/utils/MemoizeHelper';
import { assertType } from '../../../commons/utils/TypeHelper';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';

export type StoriesSideContentProps = Omit<GenericSideContentProps, 'renderFunction'> & StateProps;

type StateProps = {
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
};

/**
 * Adds 'side-content-tab-alert' style to newly spawned module tabs or HTML Display tab
 */
const generateClassName = (id: string | undefined) =>
  id === SideContentType.module || id === SideContentType.htmlDisplay
    ? 'side-content-tooltip side-content-tab-alert'
    : 'side-content-tooltip';

const renderTab = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
  const iconSize = 20;
  const tabId = tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
  const tabTitle = (
    <Tooltip2 content={tab.label}>
      <div className={generateClassName(tab.id)} id={generateIconId(tabId)}>
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
          workspaceLocation
        }
      }
    : tab.body;
  const tabPanel: JSX.Element = <div className="side-content-text">{tabBody}</div>;

  return <Tab key={tabId} {...tabProps} panel={tabPanel} />;
};

// TODO: Reduce code duplication with the main SideContent component
const StoriesSideContent: React.FC<StoriesSideContentProps> = ({
  selectedTabId,
  renderActiveTabPanelOnly,
  ...otherProps
}) => {
  return (
    <GenericSideContent
      {...otherProps}
      renderFunction={(dynamicTabs, changeTabsCallback) => (
        <div className="stories-side-content">
          <Card>
            <div className="side-content-tabs">
              <Tabs
                id="side-content-tabs"
                onChange={changeTabsCallback}
                renderActiveTabPanelOnly={renderActiveTabPanelOnly}
                selectedTabId={selectedTabId}
              >
                {dynamicTabs.map(tab => renderTab(tab, otherProps.workspaceLocation))}
              </Tabs>
            </div>
          </Card>
        </div>
      )}
    />
  );
};

export default React.memo(StoriesSideContent, propsAreEqual);
