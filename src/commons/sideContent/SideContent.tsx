import { Card, Icon, Tab, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import GenericSideContent, { generateIconId } from './GenericSideContent';
import { SideContentTab, SideContentType } from './SideContentTypes';

/**
 * @property onChange A function that is called whenever the
 * active tab is changed by the user.
 *
 * @property tabs An array of SideContentTabs.
 *  The tabs will be rendered in order of the array.
 *  If this array is empty, no tabs will be rendered.
 *
 * @property renderActiveTabPanelOnly Set this property to
 * true to enable unmounting of tab panels whenever tabs are
 * switched. If it is left undefined, the value will default
 * to false, and the tab panels will all be loaded with the
 * mounting of the SideContent component. Switching tabs
 * will merely hide them from view.
 */
export type SideContentProps = DispatchProps & StateProps;

type DispatchProps = {
  // Optional due to uncontrolled tab component in EditingWorkspace
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
  tabs: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  workspaceLocation?: WorkspaceLocation;
  editorWidth?: string;
  sideContentHeight?: number;
};

/**
 * Adds 'side-content-tab-alert' style to newly spawned module tabs or HTML Display tab
 */
const generateClassName = (id: string | undefined) =>
  id === SideContentType.module || id === SideContentType.htmlDisplay
    ? 'side-content-tooltip side-content-tab-alert'
    : 'side-content-tooltip';

const renderTab = (
  tab: SideContentTab,
  workspaceLocation?: WorkspaceLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const iconSize = 20;
  const tabId = tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
  const tabTitle: JSX.Element = (
    <Tooltip2 content={tab.label}>
      <div className={generateClassName(tab.id)} id={generateIconId(tabId)}>
        <Icon icon={tab.iconName} iconSize={iconSize} />
      </div>
    </Tooltip2>
  );
  const tabProps: Partial<TabProps> = {
    id: tabId,
    title: tabTitle,
    disabled: tab.disabled,
    className: 'side-content-tab'
  };

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

const SideContent = (props: SideContentProps) => {
  const renderTabs = React.useCallback(
    (dynamicTabs: SideContentTab[]) => {
      return dynamicTabs.map(tab =>
        renderTab(tab, props.workspaceLocation, props.editorWidth, props.sideContentHeight)
      );
    },
    [props.workspaceLocation, props.editorWidth, props.sideContentHeight]
  );

  return (
    <GenericSideContent
      {...props}
      renderFunction={(dynamicTabs, changeTabsCallback) => {
        return (
          <div className="side-content">
            <Card>
              <div className="side-content-tabs">
                <Tabs
                  id="side-content-tabs"
                  onChange={changeTabsCallback}
                  renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
                  selectedTabId={props.selectedTabId}
                >
                  {renderTabs(dynamicTabs)}
                </Tabs>
              </div>
            </Card>
          </div>
        );
      }}
    />
  );
};

export default SideContent;
