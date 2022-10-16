import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type SideBarTab = {
  label: string;
  body: JSX.Element;
};

export type SideBarProps = {
  tabs: SideBarTab[];
  isExpanded: boolean;
  expandSideBar: () => void;
  collapseSideBar: () => void;
};

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {
  const { tabs, isExpanded, expandSideBar, collapseSideBar } = props;

  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number>(0);

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
      <div className="tab-container">
        {tabs.map((tab, index) => (
          <Card
            key={index}
            className={classNames('tab', { selected: isExpanded && selectedTabIndex === index })}
            onClick={() => handleTabSelection(index)}
          >
            {tab.label}
          </Card>
        ))}
      </div>
      {selectedTabIndex !== null && <Card className="panel">{tabs[selectedTabIndex].body}</Card>}
    </div>
  );
};

export default SideBar;
