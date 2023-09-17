import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import ControlButton from 'src/commons/ControlButton';

type ControlBarResetButtonProps = {
  onClick?(): any;
};

export const ControlBarResetButton: React.FC<ControlBarResetButtonProps> = ({ onClick }) => {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} />;
};
