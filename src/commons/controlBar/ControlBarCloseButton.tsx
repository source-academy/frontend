import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarCloseButtonProps = {
  handleClose: () => void;
};

export const ControlBarCloseButton: React.FC<ControlBarCloseButtonProps> = ({ handleClose }) => {
  return <ControlButton label="Close" icon={IconNames.CROSS} onClick={handleClose} />;
};
