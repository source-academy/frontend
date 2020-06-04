import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import controlButton from '../../commons/ControlButton';

export type SaveButtonProps = {
  key: string;
  hasUnsavedChanges?: boolean;
  onClickSave?(): any;
};

export function SaveButton(props: SaveButtonProps) {
  const saveButtonOpts = props.hasUnsavedChanges ? { intent: Intent.WARNING, minimal: false } : {};

  return controlButton('Save', IconNames.FLOPPY_DISK, props.onClickSave, saveButtonOpts);
}
