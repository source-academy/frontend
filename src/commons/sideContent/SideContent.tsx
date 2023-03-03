import { Card, Icon, Tab, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { propsAreEqual } from '../utils/MemoizeHelper';
import { assertType } from '../utils/TypeHelper';
import type { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import SideContentProvider from './SideContentProvider';
import { SideContentBaseProps, SideContentTab, SideContentType } from './SideContentTypes';

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
export type SideContentProps = SideContentBaseProps & StateProps;

type StateProps = {
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
  editorWidth?: string;
  sideContentHeight?: number;
};

const renderTab = (
  tab: SideContentTab,
  shouldAlert: boolean,
  workspaceLocation?: WorkspaceLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const tabId = tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
  const iconClassName = shouldAlert
    ? 'side-content-tooltip side-content-tab-alert'
    : 'side-content-tooltip';

  const tabTitle = (
    <Tooltip2 content={tab.label}>
      <div className={iconClassName}>
        <Icon icon={tab.iconName} iconSize={20} />
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

const SideContent: React.FC<SideContentProps> = ({
  renderActiveTabPanelOnly,
  editorWidth,
  sideContentHeight,
  onChange,
  selectedTabId,
  workspaceLocation,
  tabs
}) => {
  return (
    <div className="side-content">
      <Card>
        <div className="side-content-tabs">
          <SideContentProvider workspaceLocation={workspaceLocation} selectedTabId={selectedTabId}>
            {({ moduleTabs, alertedTabs, visitTab }) => (
              <Tabs
                id="side-content-tabs"
                onChange={(newId: SideContentType, prevId: SideContentType, event) => {
                  visitTab(newId);
                  if (onChange) onChange(newId, prevId, event);
                }}
                renderActiveTabPanelOnly={renderActiveTabPanelOnly}
                selectedTabId={selectedTabId}
              >
                {[...tabs.beforeDynamicTabs, ...moduleTabs, ...tabs.afterDynamicTabs].map(tab => {
                  const tabId =
                    tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
                  return renderTab(
                    tab,
                    alertedTabs.includes(tabId),
                    workspaceLocation,
                    editorWidth,
                    sideContentHeight
                  );
                })}
              </Tabs>
            )}
          </SideContentProvider>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(SideContent, propsAreEqual);
