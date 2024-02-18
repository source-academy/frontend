import { Button, Classes, Dialog, Intent, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import ControlButton from 'src/commons/ControlButton';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { AdminPanelStoriesUser } from 'src/features/stories/StoriesTypes';

type DeleteStoriesUserCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelStoriesUser;
  rowIndex: number;
  handleDeleteStoriesUserFromUserGroup: (id: number) => void;
};

const DeleteStoriesUserCell: React.FC<DeleteStoriesUserCellProps> = props => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const clickHandler = () => {
    if (props.data.role === StoriesRole.Admin) {
      showWarningMessage('You cannot delete an admin user!');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDelete = React.useCallback(() => {
    props.handleDeleteStoriesUserFromUserGroup(props.data.id);
    setIsDialogOpen(false);
  }, [props]);

  return (
    <>
      <Popover2
        content="You cannot delete an admin!"
        interactionKind="click"
        position={Position.TOP}
        disabled={props.data.role !== StoriesRole.Admin}
      >
        <Button
          text="Delete User"
          icon={IconNames.CROSS}
          onClick={clickHandler}
          disabled={props.data.role === StoriesRole.Admin}
        />
      </Popover2>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Deleting Stories User"
        canOutsideClickClose
      >
        <div className={Classes.DIALOG_BODY}>
          <p>
            Are you sure you want to <b>delete</b> the user{' '}
            <i>
              {props.data.name} ({props.data.username})
            </i>
            ?
          </p>
          <p>
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <ControlButton
              label="Cancel"
              icon={IconNames.CROSS}
              onClick={() => setIsDialogOpen(false)}
              options={{ minimal: false }}
            />
            <ControlButton
              label="Confirm"
              icon={IconNames.TRASH}
              onClick={handleDelete}
              options={{ minimal: false, intent: Intent.DANGER }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteStoriesUserCell;
