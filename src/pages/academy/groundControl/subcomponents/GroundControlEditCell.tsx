import { Classes, Dialog, Intent } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import controlButton from '../../../../commons/ControlButton';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';

export type EditCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
};

type StateProps = {
  data: AssessmentOverview;
  forOpenDate: boolean;
};

const EditCell: React.FunctionComponent<EditCellProps> = props => {
  const minDate = new Date(2010, 0, 0);
  const maxDate = new Date(2030, 11, 31);

  const { data, forOpenDate } = props;
  const currentDateString = forOpenDate ? data.openAt : data.closeAt;

  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);
  const [newDate, setNewDate] = React.useState<Date>(new Date(currentDateString));

  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const { handleAssessmentChangeDate } = props;

  const handleUpdateDate = React.useCallback(() => {
    const { id, openAt, closeAt } = data;
    handleAssessmentChangeDate(
      id,
      forOpenDate ? newDate.toISOString() : openAt,
      forOpenDate ? closeAt : newDate.toISOString()
    );
    handleCloseDialog();
  }, [data, forOpenDate, newDate, handleAssessmentChangeDate, handleCloseDialog]);

  const handleParseDate = (str: string) => new Date(str);
  const handleFormatDate = (date: Date) => date.toLocaleString();

  const handleDateChange = React.useCallback((selectedDate: Date) => setNewDate(selectedDate), []);

  const dateInput = (
    <DateInput
      formatDate={handleFormatDate}
      onChange={handleDateChange}
      parseDate={handleParseDate}
      value={newDate}
      timePrecision={'second'}
      fill={true}
      minDate={minDate}
      maxDate={maxDate}
      closeOnSelection={false}
    />
  );

  return (
    <>
      {getPrettyDate(currentDateString)}
      {controlButton('', IconNames.EDIT, handleOpenDialog)}
      <Dialog
        icon={IconNames.INFO_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Updating assessment settings"
        canOutsideClickClose={true}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{forOpenDate ? 'Opening' : 'Closing'} date and time:</p>
          {dateInput}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {controlButton('Cancel', IconNames.CROSS, handleCloseDialog, { minimal: false })}
            {controlButton('Confirm', IconNames.TICK, handleUpdateDate, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EditCell;
