import * as React from 'react';

type SicpDisplayProps = DispatchProps & StateProps & OwnProps;
type DispatchProps = {};
type StateProps = {};
type OwnProps = {};

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  return (
    <div>
      Sicp Placeholder Div
    </div>
  );
};

export default SicpDisplay;
