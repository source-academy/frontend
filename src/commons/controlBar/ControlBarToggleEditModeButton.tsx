import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../ControlButton';

type Props = {
  toggleEditMode?(): void;
  editingMode?: string;
};

function ControlBarToggleEditModeButton({ toggleEditMode, editingMode }: Props) {
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
}

export default ControlBarToggleEditModeButton;
