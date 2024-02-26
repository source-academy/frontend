import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarResetButtonProps = {
  onClick?(): any;
  disabled?: boolean;
};

export const ControlBarResetButton: React.FC<ControlBarResetButtonProps> = ({
  onClick,
  disabled
}) => {
  return (
    <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} isDisabled={disabled} />
  );
};
