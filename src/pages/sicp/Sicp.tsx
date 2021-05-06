import * as React from 'react';

import SicpDisplay from './subcomponents/SicpDisplay';

type SicpProps = DispatchProps & StateProps & OwnProps;
type DispatchProps = {};
type StateProps = {};
type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {
  return (
    <SicpDisplay />
  );
};

export default Sicp;
