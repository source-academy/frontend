import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React from 'react';

import ControlButton from '../ControlButton';

type Props = {
  isFolderModeEnabled: boolean;
  isSessionActive: boolean;
  isPersistenceActive: boolean;
  isSupportedSource: boolean;
  toggleFolderMode: () => void;
};

export const ControlBarToggleFolderModeButton: React.FC<Props> = ({
  isFolderModeEnabled,
  isSessionActive,
  isPersistenceActive,
  isSupportedSource,
  toggleFolderMode
}) => {
  const tooltipContent = isSessionActive
    ? 'Currently unsupported while a collaborative session is active'
    : isPersistenceActive
    ? 'Currently unsupported while a persistence method is active'
    : !isSupportedSource
    ? 'Folder mode is not available for this version of Source'
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
        isDisabled={isSessionActive || isPersistenceActive || !isSupportedSource}
      />
    </Tooltip2>
  );
};
