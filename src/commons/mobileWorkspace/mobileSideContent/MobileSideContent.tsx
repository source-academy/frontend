import { Classes, Icon, Tab, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import {
  mapDispatchToProps,
  mapStateToProps,
  SideContentProps
} from 'src/commons/sideContent/SideContent';
import { SideContentContainerProps } from 'src/commons/sideContent/SideContentContainer';
import { generateIconId } from 'src/commons/sideContent/SideContentHelper';

import { ControlBarProps } from '../../controlBar/ControlBar';
import { SideContentTab } from '../../sideContent/SideContentTypes';
import { propsAreEqual } from '../../utils/MemoizeHelper';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import MobileControlBar from './MobileControlBar';

export type MobileSideContentProps = SideContentProps &
  Required<Pick<SideContentProps, 'onChange'>> &
  MobileControlBarProps;

type MobileControlBarProps = {
  mobileControlBarProps: ControlBarProps;
};

type OwnProps = SideContentContainerProps & MobileControlBarProps;

const renderTab = (tab: SideContentTab, isIOS: boolean, workspaceLocation?: WorkspaceLocation) => {
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

const MobileSideContent: React.FC<OwnProps> = ({
  selectedTabId,
  renderActiveTabPanelOnly,
  mobileControlBarProps,
  onChange: changeTabsCallback,
  tabs: allTabs,
  workspaceLocation
}) => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  /**
   * renderedPanels is not memoized since a change in selectedTabId (when changing tabs)
   * would force React.useMemo to recompute the nullary function anyway
   */
  const renderedPanels = (dynamicTabs: SideContentTab[]) => {
    // TODO: Fix the CSS of all the panels (e.g. subst_visualizer)
    const renderPanel = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
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

    return dynamicTabs.map(tab => renderPanel(tab, workspaceLocation));
  };

  return (
    <>
      {renderedPanels(allTabs)}
      <div className="mobile-tabs-container">
        <Tabs
          id="mobile-side-content"
          onChange={changeTabsCallback}
          renderActiveTabPanelOnly={renderActiveTabPanelOnly}
          selectedTabId={selectedTabId}
          className={classNames(Classes.DARK, 'mobile-side-content')}
        >
          {allTabs.map(tab => renderTab(tab, isIOS, workspaceLocation))}

          {/* Render the bottom ControlBar 'Cog' button only in the Playground or Sicp Workspace */}
          {(workspaceLocation === 'playground' || workspaceLocation === 'sicp') && (
            <MobileControlBar {...mobileControlBarProps} />
          )}
        </Tabs>
      </div>
    </>
  );
};

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(MobileSideContent),
  propsAreEqual
);
