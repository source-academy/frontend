import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

/**
 * @prop fileMode an integer for the mode of the file where
 *   0 = read-only and 1 = read-write.
 */
type ControlBarFileModeButtonProps = {
  fileMode: number | null;
};

export const ControlBarFileModeButton: React.FC<ControlBarFileModeButtonProps> = ({ fileMode }) => {
  if (fileMode === 0) {
    return <ControlButton label={'Read-Only'} icon={IconNames.LOCK} isDisabled />;
  }
  return <ControlButton label={'Read-Write'} icon={IconNames.UNLOCK} isDisabled />;
};
