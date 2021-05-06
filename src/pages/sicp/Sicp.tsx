import * as React from 'react';

import SicpDisplay from './subcomponents/SicpDisplay';

type SicpProps = DispatchProps & StateProps & OwnProps;
type DispatchProps = {};
type StateProps = {};
type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {

  const content = "text";

  return (
    <SicpDisplay content={content} />
  );
};

export default Sicp;
