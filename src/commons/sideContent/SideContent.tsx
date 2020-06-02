import { Card, Icon, Tab, TabId, Tabs, Tooltip } from '@blueprintjs/core';
import * as React from 'react';

import { WorkspaceLocations } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { dynamicTabUpdateInterval, SideContentTab, SideContentType } from './SideContentTypes';

/**
 * @property animate Set this to false to disable the movement
 * of the selected tab indicator. Default value: true.
 *
 * @property defaultSelectedTabId The id of a SideContentTab to be
 *  selected initially when the SideContent component is mounted.
 *
 * @property handleActiveTabChange A dispatch bound to the
 * UPDATE_ACTIVE_TAB action creator; updates the Redux store with
 * the id of the active side content tab in the current workspace.
 *
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
  handleActiveTabChange: (activeTab: SideContentType) => void;
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  animate?: boolean;
  selectedTabId?: SideContentType;
  defaultSelectedTabId?: SideContentType;
  renderActiveTabPanelOnly?: boolean;
  tabs: SideContentTab[];
  location?: WorkspaceLocations;
};

const SideContent = (props: SideContentProps) => {

  const [dynamicTabs, setDynamicTabs] = React.useState([sampleTab, sampleTab, sampleTab]);

  const visibleTabs = dynamicTabs.filter(tab => tab.isVisible);

  // Include props.tabs for backward compability
  const activeTabs = [...props.tabs, ...visibleTabs];

  /**
   * Update dynamic tabs visibility by invoking their methods.
   */
  const updateTabsVisiblity = () => {
    const areTabsVisible = dynamicTabs.map(tab => tab.toSpawn() && !tab.toDespawn());
  
    const newDynamicTabs = [] as SideContentTab[];
    for (let i = 0; i < dynamicTabs.length; i++) {
      newDynamicTabs.push({...dynamicTabs[i], 
        isVisible : areTabsVisible[i]});
    }

    if (newDynamicTabs !== dynamicTabs) {
      setDynamicTabs(newDynamicTabs);
    }
  };

  /**
   * Remove the 'side-content-tab-alert' class that causes tabs flash.
   * To be run when tabs are changed.
   * Currently this style is only used for the "Inspector" and "Env Visualizer" tabs.
   */
  const resetAlert = (prevTabId: TabId) => {
    const iconId = generateIconId(prevTabId);
    const icon = document.getElementById(iconId);

    // The new selected tab will still have the "side-content-tab-alert" class, but the CSS hides it
    if (icon) {
      icon.classList.remove('side-content-tab-alert');
    }
  };

  /**
   * Generate an icon id given a TabId.
   * Used to set and remove the 'side-content-tab-alert' style to the tabs.
   */
  const generateIconId = (tabId: TabId) => {
    return `${tabId}-icon`;
  };

  const renderTab = (tab: SideContentTab) => {
    const iconSize = 20;
    const tabId = tab.id === undefined ? tab.label : tab.id;
    const tabTitle: JSX.Element = (
      <Tooltip content={tab.label}>
        <div className="side-content-tooltip" id={generateIconId(tabId)}>
          <Icon icon={tab.iconName} iconSize={iconSize} />
        </div>
      </Tooltip>
    );
    const tabPanel: JSX.Element = <div className="side-content-text">{tab.body}</div>;

    return (
      <Tab
        key={tabId}
        id={tabId}
        title={tabTitle}
        panel={tabPanel}
        disabled={tab.disabled}
        className="side-content-tab"
      />
    );
  };

  const renderedTabs = activeTabs.map(renderTab);

  const changeTabsCallback = (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ): void => {
    props.handleActiveTabChange(newTabId);
    if (props.onChange === undefined) {
      resetAlert(prevTabId);
    } else {
      props.onChange(newTabId, prevTabId, event);
      resetAlert(prevTabId);
    }
  };

  React.useEffect(() => {
    // Set initial sideContentActiveTab for this workspace
    props.handleActiveTabChange(
      props.defaultSelectedTabId ? props.defaultSelectedTabId : props.tabs[0].id!
    );
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      updateTabsVisiblity();
    }, dynamicTabUpdateInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="side-content">
      <Card>
        <div className="side-content-tabs">
          <Tabs
            id="side-content-tabs"
            onChange={changeTabsCallback}
            defaultSelectedTabId={props.defaultSelectedTabId}
            renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
            selectedTabId={props.selectedTabId}
          >
            {renderedTabs}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default SideContent;
