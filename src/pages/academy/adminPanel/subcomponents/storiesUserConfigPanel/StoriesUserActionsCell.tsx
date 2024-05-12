import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  Popover,
  Position
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import ControlButton from 'src/commons/ControlButton';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { AdminPanelStoriesUser } from 'src/features/stories/StoriesTypes';

type Props = {
  data: AdminPanelStoriesUser;
  rowIndex: number;
  handleDeleteStoriesUserFromUserGroup: (id: number) => void;
};

const DeleteStoriesUserCell: React.FC<Props> = ({ data, handleDeleteStoriesUserFromUserGroup }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const clickHandler = () => {
    if (data.role === StoriesRole.Admin) {
      showWarningMessage('You cannot delete an admin user!');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDelete = useCallback(() => {
    handleDeleteStoriesUserFromUserGroup(data.id);
    setIsDialogOpen(false);
  }, [data.id, handleDeleteStoriesUserFromUserGroup]);

  return (
    <>
      <Popover
        content="You cannot delete an admin!"
        interactionKind="click"
        position={Position.TOP}
        disabled={data.role !== StoriesRole.Admin}
      >
        <Button
          text="Delete User"
          icon={IconNames.CROSS}
          onClick={clickHandler}
          disabled={data.role === StoriesRole.Admin}
        />
      </Popover>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Deleting Stories User"
        canOutsideClickClose
      >
        <DialogBody>
          <p>
            Are you sure you want to <b>delete</b> the user{' '}
            <i>
              {data.name} ({data.username})
            </i>
            ?
          </p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
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
            </>
          }
        />
      </Dialog>
    </>
  );
};

export default DeleteStoriesUserCell;
