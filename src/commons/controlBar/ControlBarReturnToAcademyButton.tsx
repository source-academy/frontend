import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

export const ControlBarReturnToAcademyButton: React.FC<Props> = ({ onClick }) => {
  return (
    <ControlButton
      label="Return to Academy"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
};
