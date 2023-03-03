import { Classes, Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';
import SideContentProvider from 'src/commons/sideContent/SideContentProvider';

import { ControlBarProps } from '../../controlBar/ControlBar';
import {
  SideContentBaseProps,
  SideContentTab,
  SideContentType
} from '../../sideContent/SideContentTypes';
import { propsAreEqual } from '../../utils/MemoizeHelper';
import MobileControlBar from './MobileControlBar';

export type MobileSideContentProps = SideContentBaseProps &
  Required<Pick<SideContentBaseProps, 'onChange'>> &
  StateProps &
  MobileControlBarProps;

type StateProps = {
  selectedTabId: SideContentType;
  renderActiveTabPanelOnly?: boolean;
};

type MobileControlBarProps = {
  mobileControlBarProps: ControlBarProps;
};

/**
 * Generates an icon id given a TabId.
 * Used to set and remove the 'side-content-tab-alert' style to the tabs.
 */
const generateIconId = (tabId: TabId) => `${tabId}-icon`;

const renderTab = (tab: SideContentTab, isIOS: boolean) => {
  const iconSize = 20;
  const tabId = tab.id === undefined ? tab.label : tab.id;
  const tabTitle: JSX.Element = (
    <Tooltip2
      content={tab.label}
      onOpening={() => {
        // Handles iOS hover requiring double taps to press the button
        if (isIOS) {
          document.getElementById(generateIconId(tabId))?.click();
        }
      }}
    >
      <div className="side-content-tooltip" id={generateIconId(tabId)}>
        <Icon icon={tab.iconName} iconSize={iconSize} />
      </div>
    </Tooltip2>
  );

  return (
    <Tab
      key={tabId}
      id={tabId}
      title={tabTitle}
      disabled={tab.disabled}
      className="side-content-tab"
    />
  );
};

const MobileSideContent: React.FC<MobileSideContentProps> = ({
  selectedTabId,
  renderActiveTabPanelOnly,
  mobileControlBarProps,
  workspaceLocation,
  tabs,
  onChange
}) => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  /**
   * renderedPanels is not memoized since a change in selectedTabId (when changing tabs)
   * would force React.useMemo to recompute the nullary function anyway
   */
  // TODO: Fix the CSS of all the panels (e.g. subst_visualizer)
  const renderPanel = (tab: SideContentTab) => {
    if (!tab.body) return;

    const tabBody: JSX.Element = workspaceLocation
      ? {
          ...tab.body,
          props: {
            ...tab.body.props,
            workspaceLocation
          }
        }
      : tab.body;

    // Render the other panels only when their corresponding tab is selected
    return (
      <div
        className={tab.id === selectedTabId ? 'mobile-selected-panel' : 'mobile-unselected-panel'}
        key={tab.id}
      >
        {tabBody}
      </div>
    );
  };

  return (
    <SideContentProvider>
      {({ moduleTabs }) => (
        <>
          {moduleTabs.map(tab => renderPanel(tab))}
          <div className="mobile-tabs-container">
            <Tabs
              id="mobile-side-content"
              onChange={(newId: SideContentType, oldId: SideContentType, event) =>
                onChange(newId, oldId, event)
              }
              renderActiveTabPanelOnly={renderActiveTabPanelOnly}
              selectedTabId={selectedTabId}
              className={classNames(Classes.DARK, 'mobile-side-content')}
            >
              {[...tabs.beforeDynamicTabs, ...moduleTabs, ...tabs.afterDynamicTabs].map(tab =>
                renderTab(tab, isIOS)
              )}

              {/* Render the bottom ControlBar 'Cog' button only in the Playground or Sicp Workspace */}
              {(workspaceLocation === 'playground' || workspaceLocation === 'sicp') && (
                <MobileControlBar {...mobileControlBarProps} />
              )}
            </Tabs>
          </div>
        </>
      )}
    </SideContentProvider>
  );
};

export default React.memo(MobileSideContent, propsAreEqual);
