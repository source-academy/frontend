import { Classes, Icon, Tab, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React from 'react';

import { ControlBarProps } from '../../controlBar/ControlBar';
import GenericSideContent, { generateIconId } from '../../sideContent/GenericSideContent';
import { SideContentTab, SideContentType } from '../../sideContent/SideContentTypes';
import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import MobileControlBar from './MobileControlBar';

export type MobileSideContentProps = DispatchProps & StateProps & MobileControlBarProps;

type DispatchProps = {
  onChange: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  selectedTabId: SideContentType;
  renderActiveTabPanelOnly?: boolean;
  tabs: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
  workspaceLocation?: WorkspaceLocation;
};

type MobileControlBarProps = {
  mobileControlBarProps: ControlBarProps;
};

const MobileSideContent: React.FC<MobileSideContentProps> = props => {
  const { selectedTabId, ...otherProps } = props;

  const isIOS = /iPhone|iPod/.test(navigator.platform);

  /**
   * renderedPanels is not memoized since a change in selectedTabId (when changing tabs)
   * would force React.useMemo to recompute the nullary function anyway
   */
  const renderedPanels = (dynamicTabs: SideContentTab[]) => {
    // TODO: Fix the CSS of all the panels (e.g. subst_visualizer)
    const renderPanel = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      if (!tab.body) {
        return;
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

    return [...dynamicTabs.map(tab => renderPanel(tab, props.workspaceLocation))];
  };

  const renderTabs = React.useCallback(
    (dynamicTabs: SideContentTab[]) => {
      const renderTab = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
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

      return dynamicTabs.map(tab => renderTab(tab, props.workspaceLocation));
    },
    [props.workspaceLocation, isIOS]
  );

  return (
    <GenericSideContent
      {...otherProps}
      renderFunction={(dynamicTabs, changeTabsCallback) => {
        return (
          <>
            {renderedPanels(dynamicTabs)}
            <div className="mobile-tabs-container">
              <Tabs
                id="mobile-side-content"
                onChange={changeTabsCallback}
                renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
                selectedTabId={props.selectedTabId}
                className={classNames(Classes.DARK, 'mobile-side-content')}
              >
                {renderTabs(dynamicTabs)}

                {/* Render the bottom ControlBar 'Cog' button only in the Playground or Sicp Workspace */}
                {(props.workspaceLocation === 'playground' ||
                  props.workspaceLocation === 'sicp') && (
                  <MobileControlBar {...props.mobileControlBarProps} />
                )}
              </Tabs>
            </div>
          </>
        );
      }}
    />
  );
};

export default MobileSideContent;
