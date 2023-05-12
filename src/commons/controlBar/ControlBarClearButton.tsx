import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import ControlButton from 'src/commons/ControlButton';

type ControlBarClearButtonProps = {
  handleReplOutputClear: () => void;
};

export const ControlBarClearButton: React.FC<ControlBarClearButtonProps> = ({
  handleReplOutputClear
}) => {
  return <ControlButton label="Clear" icon={IconNames.REMOVE} onClick={handleReplOutputClear} />;
};
