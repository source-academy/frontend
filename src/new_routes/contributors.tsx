import { Elevation } from '@blueprintjs/core';
import { PageCard, PageWrapper } from 'src/components/ui/page';

import ContributorsDetails from '../pages/contributors/subcomponents/ContributorsDetails';
import ContributorsList from '../pages/contributors/subcomponents/ContributorsList';

function ContributorsPage() {
  return (
    <PageWrapper>
      <PageCard elevation={Elevation.THREE}>
        <ContributorsDetails />
        <ContributorsList />
      </PageCard>
    </PageWrapper>
  );
}

export const Component = ContributorsPage;
