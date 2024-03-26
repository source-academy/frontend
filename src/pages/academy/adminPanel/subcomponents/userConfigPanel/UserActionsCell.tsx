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
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';
import ControlButton from 'src/commons/ControlButton';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

type Props = {
  data: AdminPanelCourseRegistration;
  rowIndex: number; // unused prop
  handleDeleteUserFromCourse: (courseRegId: number) => void;
};

const DeleteUserCell: React.FC<Props> = ({ data, handleDeleteUserFromCourse }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const clickHandler = () => {
    if (data.role === Role.Admin) {
      showWarningMessage('You cannot delete an admin user!');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDelete = useCallback(() => {
    handleDeleteUserFromCourse(data.courseRegId);
    setIsDialogOpen(false);
  }, [data.courseRegId, handleDeleteUserFromCourse]);

  return (
    <>
      <Popover
        content="You cannot delete an admin!"
        interactionKind="click"
        position={Position.TOP}
        disabled={data.role !== Role.Admin}
      >
        <Button
          text="Delete User"
          icon={IconNames.CROSS}
          onClick={clickHandler}
          disabled={data.role === Role.Admin}
        />
      </Popover>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Deleting User From Course"
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
          <p>
            <b>All their assessment answers will be deleted as well.</b>
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

export default DeleteUserCell;
