import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import controlButton from '../ControlButton';

type SaveButtonProps = DispatchProps & StateProps;

type DispatchProps = {
  onClickSave?(): any;
};

type StateProps = {
  key: string;
  hasUnsavedChanges?: boolean;
};

export function SaveButton(props: SaveButtonProps) {
  const saveButtonOpts = props.hasUnsavedChanges ? { intent: Intent.WARNING, minimal: false } : {};

  return controlButton('Save', IconNames.FLOPPY_DISK, props.onClickSave, saveButtonOpts);
}
