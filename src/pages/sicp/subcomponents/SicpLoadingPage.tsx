import { H3, Intent, Spinner } from '@blueprintjs/core';
import * as React from 'react';

const SicpLoadingPage: React.FC = props => {
  return (
    <div className="sicp-loading-page">
      <Spinner intent={Intent.PRIMARY} />
      <H3>Loading Content</H3>
    </div>
  );
};

export default SicpLoadingPage;
