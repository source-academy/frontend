import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarPreviousButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClick?(): any;
};

type StateProps = {
  key: string;
  questionProgress: [number, number] | null;
};

export const ControlBarPreviousButton: React.FC<ControlBarPreviousButtonProps> = props => {
  return props.questionProgress![0] <= 1 ? null : (
    <ControlButton label="Previous" icon={IconNames.ARROW_LEFT} onClick={props.onClick} />
  );
};
