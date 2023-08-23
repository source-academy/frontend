import { Card, Icon, Tab, TabProps, Tabs } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import * as React from 'react';

import { assertType } from '../utils/TypeHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { generateTabAlert, getTabId } from './SideContentHelper';
import { SideContentTab, SideContentType } from './SideContentTypes';

/**
 * SideContentContainerOwnProps refers to the props provided by the user
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
export type SideContentContainerOwnProps = {
  selectedTabId?: SideContentType; // Optional due to uncontrolled tab component in EditingWorkspace
  renderActiveTabPanelOnly?: boolean;
  editorWidth?: string;
  sideContentHeight?: number;
  workspaceLocation?: WorkspaceLocation;
  onChange?: SideContentContainerDispatchProps['onChange'];
  tabs?: {
    beforeDynamicTabs: SideContentTab[];
    afterDynamicTabs: SideContentTab[];
  };
};

/**
 * Refers to props provided by `mapStateToProps`
 */
export type SideContentContainerStateProps = {
  tabs: SideContentTab[];
  alerts: string[];
};

/**
 * Refers to props provided by `mapDispatchToProps`
 */
export type SideContentContainerDispatchProps = {
  onChange: (
    newId: SideContentType,
    oldId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;
};

/**
 * All props used by the SideContentContainer: its state, dispatch and own props
 */
export type SideContentContainerProps = Omit<SideContentContainerOwnProps, 'tabs'> &
  SideContentContainerDispatchProps &
  SideContentContainerStateProps;

const renderTab = (
  tab: SideContentTab,
  shouldAlert: boolean,
  workspaceLocation?: WorkspaceLocation,
  editorWidth?: string,
  sideContentHeight?: number
) => {
  const iconSize = 20;
  const tabId = tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
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

export function mapStateToProps<
  TStateProps extends { dynamicTabs: SideContentTab[]; alerts: string[] },
  TOwnProps extends SideContentContainerOwnProps
>({ dynamicTabs, alerts }: TStateProps, { tabs }: TOwnProps): SideContentContainerStateProps {
  const allTabs = tabs
    ? [...tabs.beforeDynamicTabs, ...dynamicTabs, ...tabs.afterDynamicTabs]
    : dynamicTabs;

  return {
    tabs: allTabs,
    alerts
  };
}

export function mapDispatchToProps<
  TCallback extends SideContentContainerDispatchProps['onChange'],
  TOwnProps extends SideContentContainerOwnProps
>(
  dispatchOnChange: TCallback,
  { onChange: ownOnChange }: TOwnProps
): SideContentContainerDispatchProps {
  return {
    onChange: (newId, oldId, event) => {
      if (ownOnChange) ownOnChange(newId, oldId, event);
      dispatchOnChange(newId, oldId, event);
    }
  };
}

const SideContentContainer: React.FC<SideContentContainerProps> = ({
  selectedTabId,
  renderActiveTabPanelOnly,
  editorWidth,
  sideContentHeight,
  workspaceLocation,
  onChange: changeTabsCallback,
  tabs: allTabs,
  alerts
}) => {
  const tabsElement = (
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
          alerts.includes(tabId),
          workspaceLocation,
          editorWidth,
          sideContentHeight
        );
      })}
    </Tabs>
  );

  return (
    <div className="side-content">
      <Card>
        <div className="side-content-tabs">{tabsElement}</div>
      </Card>
    </div>
  );
};

export default SideContentContainer;
