import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarToggleEditModeButtonProps = {
  toggleEditMode?(): void;
  editingMode?: string;
};

export const ControlBarToggleEditModeButton: React.FC<ControlBarToggleEditModeButtonProps> = ({
  toggleEditMode,
  editingMode
}) => {
  const editMode = editingMode === 'question' ? 'Global' : 'Question Specific';
  return (
    <Tooltip content={'Switch to ' + editMode + ' Editing Mode'}>
      <ControlButton
        label={editMode + ' Editing Mode'}
        icon={IconNames.REFRESH}
        onClick={toggleEditMode}
      />
    </Tooltip>
  );
};
