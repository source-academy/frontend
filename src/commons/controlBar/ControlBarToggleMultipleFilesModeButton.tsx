import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarToggleMultipleFilesModeButtonProps = {
  isMultipleFilesEnabled: boolean;
  toggleMultipleFilesMode: () => void;
};

export const ControlBarToggleMultipleFilesModeButton: React.FC<
  ControlBarToggleMultipleFilesModeButtonProps
> = ({ isMultipleFilesEnabled, toggleMultipleFilesMode }) => {
  return (
    <ControlButton
      label="Multiple Files"
      icon={IconNames.FOLDER_CLOSE}
      options={{
        iconColor: isMultipleFilesEnabled ? Colors.BLUE4 : undefined
      }}
      onClick={toggleMultipleFilesMode}
    />
  );
};
