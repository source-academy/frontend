import { Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';
import ControlButton from 'src/commons/ControlButton';

type DeleteRowCellProps = OwnProps;

type OwnProps = {
  data: AssessmentConfiguration;
  rowIndex: number;
  deleteRowHandler: (index: number) => void;
};

const DeleteRowCell: React.FC<DeleteRowCellProps> = props => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const clickHandler = () => {
    setIsDialogOpen(true);
  };
  const handleDelete = React.useCallback(() => {
    props.deleteRowHandler(props.rowIndex);
    setIsDialogOpen(false);
  }, [props]);

  return (
    <>
      <Button icon={IconNames.CROSS} onClick={clickHandler} />
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Warning"
      >
        <div className={Classes.DIALOG_BODY}>
          <p>
            Are you sure you want to <b>delete</b> the assessment type <i>{props.data.type}</i>?
          </p>
          <p>
            <b>
              All related assessments, submissions and answers will be deleted as well upon clicking
              the main save button.
            </b>
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
              label="Ok"
              icon={IconNames.TICK}
              onClick={handleDelete}
              options={{ minimal: false, intent: Intent.WARNING }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
export default DeleteRowCell;
