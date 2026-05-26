import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  onClickSave?(): any;
  key: string;
  hasUnsavedChanges?: boolean;
  isDisabled?: boolean;
};

const ControlButtonSaveButton: React.FC<Props> = props => {
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

export default ControlButtonSaveButton;
