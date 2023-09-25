import { Classes, Icon, Tab, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';
import { SideContentLocation } from 'src/commons/redux/workspace/WorkspaceReduxTypes';
import { SideContentProps } from 'src/commons/sideContent/SideContent';
import { generateIconId } from 'src/commons/sideContent/SideContentHelper';
import { SideContentProvider } from 'src/commons/sideContent/SideContentProvider';

import { ControlBarProps } from '../../controlBar/ControlBar';
import { SideContentTab } from '../../sideContent/SideContentTypes';
import { propsAreEqual } from '../../utils/MemoizeHelper';
import MobileControlBar from './MobileControlBar';

export type MobileSideContentProps = SideContentProps & MobileControlBarProps;

type MobileControlBarProps = {
  mobileControlBarProps: ControlBarProps;
};

const renderTab = (tab: SideContentTab, isIOS: boolean, location?: SideContentLocation) => {
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
  ...otherProps
}) => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  /**
   * renderedPanels is not memoized since a change in selectedTabId (when changing tabs)
   * would force React.useMemo to recompute the nullary function anyway
   */
  const renderedPanels = (dynamicTabs: SideContentTab[]) => {
    // TODO: Fix the CSS of all the panels (e.g. subst_visualizer)
    const renderPanel = (tab: SideContentTab, location?: SideContentLocation) => {
      if (!tab.body) return;

      const tabBody: JSX.Element = location
        ? {
            ...tab.body,
            props: {
              ...tab.body.props,
              workspaceLocation: location
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

    return dynamicTabs.map(tab => renderPanel(tab, otherProps.location));
  };

  return (
    <SideContentProvider {...otherProps}>
      {(allTabs, changeTabsCallback) => (
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
              {allTabs.map(tab => renderTab(tab, isIOS, otherProps.location))}

              {/* Render the bottom ControlBar 'Cog' button only in the Playground or Sicp Workspace */}
              {(otherProps.location === 'playground' || otherProps.location === 'sicp') && (
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
