import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarToggleFolderModeButtonProps = {
  isFolderModeEnabled: boolean;
  isSessionActive: boolean;
  isPersistenceActive: boolean;
  toggleFolderMode: () => void;
};

export const ControlBarToggleFolderModeButton: React.FC<ControlBarToggleFolderModeButtonProps> = ({
  isFolderModeEnabled,
  isSessionActive,
  isPersistenceActive,
  toggleFolderMode
}) => {
  const tooltipContent = isSessionActive
    ? 'Currently unsupported while a collaborative session is active'
    : isPersistenceActive
    ? 'Currently unsupported while a persistence method is active'
    : `${isFolderModeEnabled ? 'Disable' : 'Enable'} Folder mode`;
  return (
    <Tooltip2 content={tooltipContent}>
      <ControlButton
        label="Folder"
        icon={IconNames.FOLDER_CLOSE}
        options={{
          iconColor: isFolderModeEnabled ? Colors.BLUE4 : undefined
        }}
        onClick={toggleFolderMode}
        isDisabled={isSessionActive || isPersistenceActive}
      />
    </Tooltip2>
  );
};
