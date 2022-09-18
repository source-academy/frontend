import { Card } from '@blueprintjs/core';
import React from 'react';

export type SideBarTab = {
  label: string;
};

const SideBar: React.FC = () => {
  const tabs: SideBarTab[] = [{ label: 'Project' }, { label: 'Test' }];

  return (
    <div className="tab-container">
      {tabs.map((tab, index) => (
        <Card key={index} className="tab">
          {tab.label}
        </Card>
      ))}
    </div>
  );
};

export default SideBar;
