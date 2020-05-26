import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from 'src/commons/ControlButton';

type ToggleEditModeButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  toggleEditMode?(): void;
};

type StateProps = {
  key: string;
  editingMode?: string;
};

export function ToggleEditModeButton(props: ToggleEditModeButtonProps) {
  const editMode = props.editingMode === 'question' ? 'Global' : 'Question Specific';
  return (
    <Tooltip content={'Switch to ' + editMode + ' Editing Mode'}>
      {controlButton(editMode + ' Editing Mode', IconNames.REFRESH, props.toggleEditMode)}
    </Tooltip>
  );
}
