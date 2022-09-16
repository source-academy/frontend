import { Card } from '@blueprintjs/core';
import React from 'react';

const SideBar: React.FC = () => {
  return (
    <div className="tab-container">
      <Card className="tab">Project</Card>
      <Card className="tab">Test</Card>
    </div>
  );
};

export default SideBar;
