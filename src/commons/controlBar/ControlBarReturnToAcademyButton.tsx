import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarReturnToAcademyButtonProps = {
  onClick?(): any;
};

export const ControlBarReturnToAcademyButton: React.FC<ControlBarReturnToAcademyButtonProps> = ({
  onClick
}) => {
  return (
    <ControlButton
      label="Return to Academy"
      icon={IconNames.ARROW_RIGHT}
      onClick={onClick}
      options={{ iconOnRight: true }}
    />
  );
};
