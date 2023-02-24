import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarToggleMultipleFilesModeButtonProps = {
  isMultipleFilesEnabled: boolean;
  toggleMultipleFilesMode: () => void;
};

export const ControlBarToggleMultipleFilesModeButton: React.FC<
  ControlBarToggleMultipleFilesModeButtonProps
> = ({ isMultipleFilesEnabled, toggleMultipleFilesMode }) => {
  const tooltipContent = `${isMultipleFilesEnabled ? 'Disable' : 'Enable'} multiple files mode`;
  return (
    <Tooltip2 content={tooltipContent}>
      <ControlButton
        label="Multiple Files"
        icon={IconNames.FOLDER_CLOSE}
        options={{
          iconColor: isMultipleFilesEnabled ? Colors.BLUE4 : undefined
        }}
        onClick={toggleMultipleFilesMode}
      />
    </Tooltip2>
  );
};
