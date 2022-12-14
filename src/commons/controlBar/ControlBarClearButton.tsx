import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import controlButton from '../ControlButton';

type ControlBarClearButtonProps = {
  handleReplOutputClear: () => void;
};

export const ControlBarClearButton: React.FC<ControlBarClearButtonProps> = props => {
  return controlButton('Clear', IconNames.REMOVE, props.handleReplOutputClear);
};
