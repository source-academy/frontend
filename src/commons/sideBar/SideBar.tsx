import { Card } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

export type SideBarTab = {
  label: string;
};

const SideBar: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = React.useState<number | null>(null);
  const tabs: SideBarTab[] = [{ label: 'Project' }, { label: 'Test' }];

  const handleTabSelection = (tabIndex: number) => {
    if (selectedTabIndex === tabIndex) {
      setSelectedTabIndex(null);
      return;
    }
    setSelectedTabIndex(tabIndex);
  };

  return (
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
  );
};

export default SideBar;
