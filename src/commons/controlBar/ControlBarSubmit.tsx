import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

export const ControlBarSubmit: React.FC<Props> = ({ onClick }) => {
  return (
    <ControlButton
      label="Submit"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
};
