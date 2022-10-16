import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type SideBarTab = {
  label: string;
  body: JSX.Element;
};

export type SideBarProps = {
  tabs: SideBarTab[];
};

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {
  const { tabs } = props;

  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number | null>(null);

  const handleTabSelection = (tabIndex: number) => {
    if (selectedTabIndex === tabIndex) {
      setSelectedTabIndex(null);
      return;
    }
    setSelectedTabIndex(tabIndex);
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
            className={classNames('tab', { selected: selectedTabIndex === index })}
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
