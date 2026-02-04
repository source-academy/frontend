import { Card, Elevation } from '@blueprintjs/core';
import React from 'react';

import ContributorsDetails from './subcomponents/ContributorsDetails';
import ContributorsList from './subcomponents/ContributorsList';

const Contributors: React.FC = () => (
  <div className="fullpage">
    <Card className="fullpage-content" elevation={Elevation.THREE}>
      <ContributorsDetails />
      <ContributorsList />
    </Card>
  </div>
);

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = Contributors;
Component.displayName = 'Contributors';

export default Contributors;
