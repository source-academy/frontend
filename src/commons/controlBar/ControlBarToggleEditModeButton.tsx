import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';

import ControlButton from '../ControlButton';

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
    <Tooltip2 content={'Switch to ' + editMode + ' Editing Mode'}>
      <ControlButton
        label={editMode + ' Editing Mode'}
        icon={IconNames.REFRESH}
        onClick={props.toggleEditMode}
      />
    </Tooltip2>
  );
}
