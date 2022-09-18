import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type SideBarTab = {
  label: string;
  body: JSX.Element;
};

const SideBar: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number | null>(null);
  const tabs: SideBarTab[] = [
    { label: 'Project', body: <div>Hello World!</div> },
    { label: 'Test', body: <div></div> }
  ];

  const handleTabSelection = (tabIndex: number) => {
    if (selectedTabIndex === tabIndex) {
      setSelectedTabIndex(null);
      return;
    }
    setSelectedTabIndex(tabIndex);
  };

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
