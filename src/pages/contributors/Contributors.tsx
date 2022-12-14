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

export default Contributors;
