import { Classes, Dialog, Intent } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import controlButton from '../../../../commons/ControlButton';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';
import { showWarningMessage } from '../../../../commons/utils/NotificationsHelper';

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
  const currentDateString = React.useMemo(() => (forOpenDate ? data.openAt : data.closeAt), [
    data.closeAt,
    data.openAt,
    forOpenDate
  ]);

  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);
  const [newDate, setNewDate] = React.useState<Date | null>(new Date(currentDateString));

  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const { handleAssessmentChangeDate } = props;

  const handleUpdateDate = React.useCallback(() => {
    if (!newDate) {
      // Reset date to current date if no date is selected (null date) in the date input
      showWarningMessage('No date and time selected!', 2000);
      setNewDate(new Date(currentDateString));
    } else {
      const { id, openAt, closeAt } = data;
      handleAssessmentChangeDate(
        id,
        forOpenDate ? newDate.toISOString() : openAt,
        forOpenDate ? closeAt : newDate.toISOString()
      );
      handleCloseDialog();
    }
  }, [
    data,
    forOpenDate,
    newDate,
    currentDateString,
    handleAssessmentChangeDate,
    handleCloseDialog
  ]);

  const handleParseDate = (str: string) => new Date(str);
  const handleFormatDate = (date: Date) => date.toLocaleString();

  const handleDateChange = React.useCallback((selectedDate: Date) => setNewDate(selectedDate), []);
  const handleDateError = React.useCallback(() => {
    // Reset date to current date if user enters an invalid date string
    showWarningMessage('Failed to parse date string! Defaulting to current date.', 2000);
    setNewDate(new Date(currentDateString));
  }, [currentDateString]);

  const dateInput = (
    <DateInput
      formatDate={handleFormatDate}
      onChange={handleDateChange}
      onError={handleDateError}
      parseDate={handleParseDate}
      placeholder={'MM/DD/YYYY, HH:mm:ss (AM/PM) or select a date'}
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
