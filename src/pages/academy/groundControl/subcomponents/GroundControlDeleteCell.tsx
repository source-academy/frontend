import { Dialog, DialogBody, DialogFooter, Intent, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = {
  handleDeleteAssessment: (id: number) => void;
  data: AssessmentOverview;
};

const DeleteCell: React.FC<Props> = ({ handleDeleteAssessment, data }) => {
  const [isDialogOpen, setDialogState] = useState(false);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleDelete = useCallback(() => {
    const { id } = data;
    handleDeleteAssessment(id);
    handleCloseDialog();
  }, [data, handleCloseDialog, handleDeleteAssessment]);

  return (
    <>
      <Tooltip content="Delete" placement="top">
        <ControlButton icon={IconNames.TRASH} onClick={handleOpenDialog} />
      </Tooltip>
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Deleting assessment"
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>
            Are you sure you want to <b>delete</b> the assessment <i>{data.title}</i>?
          </p>
          <p>
            <b>All submissions and their answers will be deleted as well.</b>
          </p>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <ControlButton
                label="Cancel"
                icon={IconNames.CROSS}
                onClick={handleCloseDialog}
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

export default DeleteCell;
