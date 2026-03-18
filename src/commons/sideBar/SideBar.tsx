import { Card, Icon, IconName } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { SideContentType } from '../sideContent/SideContentTypes';

/**
 * @property label The displayed name of the tab.
 * @property body The element to be rendered inside the sidebar tab.
 * @property iconName The name of the displayed icon.
 * @property id The ID of the tab when displayed as a side content on the mobile view.
 *              Omit if the tab should only be shown in the sidebar on the desktop view.
 */
export type SideBarTab = {
  label: string;
  body: JSX.Element;
  iconName: IconName;
  id?: SideContentType;
};

type Props = {
  tabs: SideBarTab[];
  isExpanded: boolean;
  expandSideBar: () => void;
  collapseSideBar: () => void;
};

const SideBar: React.FC<Props> = ({ tabs, isExpanded, expandSideBar, collapseSideBar }) => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const handleTabSelection = (tabIndex: number) => {
    if (selectedTabIndex === tabIndex) {
      if (isExpanded) {
        collapseSideBar();
      } else {
        expandSideBar();
      }
      return;
    }
    setSelectedTabIndex(tabIndex);
    expandSideBar();
  };

  // Do not render the sidebar if there are no tabs.
  if (tabs.length === 0) {
    return <div className="sidebar-container" />;
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-tab-container">
        {tabs.map((tab, index) => (
          <Card
            key={index}
            className={classNames('sidebar-tab', {
              selected: isExpanded && selectedTabIndex === index
            })}
            onClick={() => handleTabSelection(index)}
          >
            <Icon className="sidebar-tab-icon" icon={tab.iconName} size={14} />
            {tab.label}
          </Card>
        ))}
      </div>
      {selectedTabIndex !== null && (
        <Card className="sidebar-panel">{tabs[selectedTabIndex].body}</Card>
      )}
    </div>
  );
};

export default SideBar;
