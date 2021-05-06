import { Card } from '@blueprintjs/core';
import * as React from 'react';

type SicpDisplayProps = DispatchProps & StateProps & OwnProps;
type DispatchProps = {};
type StateProps = {};
type OwnProps = {
    content: string;
};

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  return (
    <Card className="sicpDisplayCard">
      {props.content}
    </Card>
  );
};

export default SicpDisplay;
