import { Button, Classes, Dialog, Intent, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';
import controlButton from 'src/commons/ControlButton';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

type DeleteUserCellProps = OwnProps;

type OwnProps = {
  data: AdminPanelCourseRegistration;
  rowIndex: number;
  handleDeleteUserFromCourse: (courseRegId: number) => void;
};

const DeleteUserCell: React.FC<DeleteUserCellProps> = props => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const clickHandler = () => {
    if (props.data.role === Role.Admin) {
      showWarningMessage('You cannot delete an admin user!');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDelete = React.useCallback(() => {
    props.handleDeleteUserFromCourse(props.data.courseRegId);
    setIsDialogOpen(false);
  }, [props]);

  return (
    <>
      <Popover2
        content="You cannot delete an admin!"
        interactionKind="click"
        position={Position.TOP}
        disabled={props.data.role !== Role.Admin}
      >
        <Button
          text="Delete User"
          icon={IconNames.CROSS}
          onClick={clickHandler}
          disabled={props.data.role === Role.Admin}
        />
      </Popover2>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Deleting User From Course"
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
            <b>All their assessment answers will be deleted as well.</b>
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {controlButton('Cancel', IconNames.CROSS, () => setIsDialogOpen(false), {
              minimal: false
            })}
            {controlButton('Confirm', IconNames.TRASH, handleDelete, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteUserCell;
