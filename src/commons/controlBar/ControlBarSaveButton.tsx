import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import ControlButton from '../ControlButton';

type ControlBarSaveButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickSave?(): any;
};

type StateProps = {
  key: string;
  hasUnsavedChanges?: boolean;
  isDisabled?: boolean;
};

export const ControlButtonSaveButton: React.FC<ControlBarSaveButtonProps> = props => {
  const saveButtonOpts = props.hasUnsavedChanges ? { intent: Intent.WARNING, minimal: false } : {};

  return (
    <ControlButton
      label="Save"
      icon={IconNames.FLOPPY_DISK}
      onClick={props.onClickSave}
      options={saveButtonOpts}
      isDisabled={props.isDisabled}
    />
  );
};
