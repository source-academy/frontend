import { Card, Elevation } from '@blueprintjs/core';

import ContributorsDetails from '../pages/contributors/subcomponents/ContributorsDetails';
import ContributorsList from '../pages/contributors/subcomponents/ContributorsList';

function ContributorsPage() {
  return (
    <div className="fullpage">
      <Card className="fullpage-content" elevation={Elevation.THREE}>
        <ContributorsDetails />
        <ContributorsList />
      </Card>
    </div>
  );
}

export const Component = ContributorsPage;
