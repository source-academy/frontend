import { Colors, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  isFolderModeEnabled: boolean;
  isSessionActive: boolean;
  isPersistenceActive: boolean;
  toggleFolderMode: () => void;
};

export const ControlBarToggleFolderModeButton: React.FC<Props> = ({
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
    <Tooltip content={tooltipContent}>
      <ControlButton
        label="Folder"
        icon={IconNames.FOLDER_CLOSE}
        options={{
          iconColor: isFolderModeEnabled ? Colors.BLUE4 : undefined
        }}
        onClick={toggleFolderMode}
        isDisabled={isSessionActive || isPersistenceActive}
      />
    </Tooltip>
  );
};
