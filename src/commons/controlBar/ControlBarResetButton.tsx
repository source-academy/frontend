import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  onClick?(): any;
};

export const ControlBarResetButton: React.FC<Props> = ({ onClick }) => {
  return <ControlButton label="Reset" icon={IconNames.REPEAT} onClick={onClick} />;
};
