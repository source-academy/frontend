import { Button, Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { IRowNode } from 'ag-grid-community';
import React, { useCallback, useState } from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import ControlButton from 'src/commons/ControlButton';

type Props = {
  data: AssessmentConfiguration;
  node: IRowNode<AssessmentConfiguration>;
  deleteRowHandler: (index: number) => void;
};

const DeleteRowCell: React.FC<Props> = ({ data, node, deleteRowHandler }) => {
  const { rowIndex } = node;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const clickHandler = () => {
    setIsDialogOpen(true);
  };
  const handleDelete = useCallback(() => {
    deleteRowHandler(rowIndex!);
    setIsDialogOpen(false);
  }, [deleteRowHandler, rowIndex]);

  return (
    <>
      <Button icon={IconNames.CROSS} onClick={clickHandler} />
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Warning"
      >
        <DialogBody>
          <p>
            Are you sure you want to <b>delete</b> the assessment type <i>{data.type}</i>?
          </p>
          <p>
            <b>
              All related assessments, submissions and answers will be deleted as well upon clicking
              the main save button.
            </b>
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
                label="Ok"
                icon={IconNames.TICK}
                onClick={handleDelete}
                options={{ minimal: false, intent: Intent.WARNING }}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
};
export default DeleteRowCell;
