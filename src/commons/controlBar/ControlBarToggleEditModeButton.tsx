import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from '../ControlButton';

type ControlBarToggleEditModeButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  toggleEditMode?(): void;
};

type StateProps = {
  key: string;
  editingMode?: string;
};

export function ControlBarToggleEditModeButton(props: ControlBarToggleEditModeButtonProps) {
  const editMode = props.editingMode === 'question' ? 'Global' : 'Question Specific';
  return (
    <Tooltip content={'Switch to ' + editMode + ' Editing Mode'}>
      {controlButton(editMode + ' Editing Mode', IconNames.REFRESH, props.toggleEditMode)}
    </Tooltip>
  );
}
