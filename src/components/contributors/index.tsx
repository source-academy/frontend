import * as React from 'react';
import ContributorsDetails from './ContributorsDetails';
import ContributorsList from './ContributorsList';

export class Contributors extends React.Component {
  public render() {
    return (
      <div>
        <ContributorsDetails />
        <ContributorsList />
      </div>
    );
  }
}

export default Contributors;
