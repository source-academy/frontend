import { Card, Icon, Tab, TabId, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../application/ApplicationTypes';
import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { getDynamicTabs } from './SideContentHelper';
import { SideContentTab, SideContentType } from './SideContentTypes';

/**
 * @property animate Set this to false to disable the movement
 * of the selected tab indicator. Default value: true.
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
  // Optional due to uncontrolled tab component in EditingWorkspace
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

type StateProps = {
  animate?: boolean;
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
  tabs: SideContentTab[];
  workspaceLocation?: WorkspaceLocation;
};

const SideContent = (props: SideContentProps) => {
  const { tabs, onChange } = props;
  const [dynamicTabs, setDynamicTabs] = React.useState(tabs);

  // Fetch debuggerContext from store
  const debuggerContext = useSelector(
    (state: OverallState) =>
      props.workspaceLocation && state.workspaces[props.workspaceLocation].debuggerContext
  );
  React.useEffect(() => {
    const allActiveTabs = tabs.concat(getDynamicTabs(debuggerContext || ({} as DebuggerContext)));
    setDynamicTabs(allActiveTabs);
  }, [tabs, debuggerContext]);

  /**
   * Generates an icon id given a TabId.
   * Used to set and remove the 'side-content-tab-alert' style to the tabs.
   */
  const generateIconId = (tabId: TabId) => `${tabId}-icon`;

  /**
   * Adds'side-content-tab-alert' style to newly spawned module tabs
   */
  const generateClassName = (id: string | undefined) =>
    id === SideContentType.module
      ? 'side-content-tooltip side-content-tab-alert'
      : 'side-content-tooltip';

  const renderedTabs = React.useMemo(() => {
    const renderTab = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      const iconSize = 20;
      const tabId = tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
      const tabTitle: JSX.Element = (
        <Tooltip2 content={tab.label}>
          <div className={generateClassName(tab.id)} id={generateIconId(tabId)}>
            <Icon icon={tab.iconName} iconSize={iconSize} />
          </div>
        </Tooltip2>
      );

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

    return dynamicTabs.map(tab => renderTab(tab, props.workspaceLocation));
  }, [dynamicTabs, props.workspaceLocation]);

  const changeTabsCallback = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ): void => {
      /**
       * Remove the 'side-content-tab-alert' class that causes tabs flash.
       * To be run when tabs are changed.
       * Currently this style is only used for the "Env Visualizer" tab.
       */
      const resetAlert = (prevTabId: TabId) => {
        const iconId = generateIconId(prevTabId);
        const icon = document.getElementById(iconId);

        // The new selected tab will still have the "side-content-tab-alert" class, but the CSS hides it
        if (icon) {
          icon.classList.remove('side-content-tab-alert');
        }
      };

      if (onChange === undefined) {
        resetAlert(prevTabId);
      } else {
        onChange(newTabId, prevTabId, event);
        resetAlert(prevTabId);
      }
    },
    [onChange]
  );

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
            {renderedTabs}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default SideContent;
