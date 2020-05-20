import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../../commons/ControlButton';

export type ToggleEditModeButtonProps = {
  key: string;
  editingMode?: string;
  toggleEditMode?(): void;
};

export function ToggleEditModeButton(props: ToggleEditModeButtonProps) {
  const editMode = props.editingMode === 'question' ? 'Global' : 'Question Specific';
  return (
    <Tooltip content={'Switch to ' + editMode + ' Editing Mode'}>
      {controlButton(editMode + ' Editing Mode', IconNames.REFRESH, props.toggleEditMode)}
    </Tooltip>
  );
}
