import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarClearButtonProps = {
  handleReplOutputClear: () => void;
};

export const ControlBarClearButton: React.FC<ControlBarClearButtonProps> = props => {
  return (
    <ControlButton label="Clear" icon={IconNames.REMOVE} onClick={props.handleReplOutputClear} />
  );
};
