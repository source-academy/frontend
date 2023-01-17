import { IconNames } from '@blueprintjs/icons';

import ControlButton from '../../ControlButton';
import { showSimpleConfirmDialog } from '../../utils/DialogHelper';
import { showWarningMessage } from '../../utils/NotificationsHelper';

export type ControlBarTaskDeleteButtonProps = {
  deleteCurrentQuestion: () => void;
  numberOfTasks: number;
  key: string;
};

export const ControlBarTaskDeleteButton: React.FC<ControlBarTaskDeleteButtonProps> = props => {
  async function onClickDelete() {
    if (props.numberOfTasks <= 1) {
      showWarningMessage('Cannot delete the only remaining task!');
      return;
    }

    const confirmDelete = await showSimpleConfirmDialog({
      contents: (
        <div>
          <p>Warning: you are about to delete a task.</p>
          <p>This action cannot be undone.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      ),
      negativeLabel: 'Cancel',
      positiveIntent: 'primary',
      positiveLabel: 'Confirm'
    });

    if (confirmDelete) {
      props.deleteCurrentQuestion();
    }
  }

  return (
    <ControlButton label="Delete Current Task" icon={IconNames.DELETE} onClick={onClickDelete} />
  );
};
