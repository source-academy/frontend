import { Classes, Dialog, Intent } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { IconNames } from '@blueprintjs/icons';
import * as moment from 'moment';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import controlButton from '../../../../commons/ControlButton';
import { showWarningMessage } from '../../../../commons/utils/NotificationsHelper';

export type EditCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
};

type StateProps = {
  data: AssessmentOverview;
  forOpenDate: boolean;
};

const dateDisplayFormat = 'YYYY-MM-DD HH:mm:ss ZZ';

const EditCell: React.FunctionComponent<EditCellProps> = props => {
  const minDate = new Date(2010, 0, 0);
  const maxDate = new Date(2030, 11, 31);

  const { data, forOpenDate } = props;
  const currentDateString = forOpenDate ? data.openAt : data.closeAt;
  const currentDate = moment(currentDateString, moment.ISO_8601, true);

  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);
  const [newDate, setNewDate] = React.useState<moment.Moment | null>(currentDate);

  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const { handleAssessmentChangeDate } = props;

  const handleUpdateDate = React.useCallback(() => {
    if (!newDate) {
      // Reset date to current date if no date is selected (null date) in the date input
      showWarningMessage('No date and time selected!', 2000);
      setNewDate(currentDate);
    } else {
      const { id, openAt, closeAt } = data;
      handleAssessmentChangeDate(
        id,
        forOpenDate ? newDate.toISOString() : openAt,
        forOpenDate ? closeAt : newDate.toISOString()
      );
      handleCloseDialog();
    }
  }, [newDate, currentDate, data, handleAssessmentChangeDate, forOpenDate, handleCloseDialog]);

  const handleParseDate = (str: string) => {
    const date = moment(str, dateDisplayFormat, true);
    return date.isValid() ? date.toDate() : false;
  };
  const handleFormatDate = (date: Date) => moment(date).format(dateDisplayFormat);

  const handleDateChange = React.useCallback(
    (selectedDate: Date) => setNewDate(moment(selectedDate)),
    []
  );
  const handleDateError = React.useCallback(() => {
    // Reset date to current date if user enters an invalid date string
    showWarningMessage('Failed to parse date string! Defaulting to current date.', 2000);
    setNewDate(currentDate);
  }, [currentDate]);

  const dateInput = (
    <DateInput
      formatDate={handleFormatDate}
      onChange={handleDateChange}
      onError={handleDateError}
      parseDate={handleParseDate}
      placeholder={`${dateDisplayFormat} or select a date`}
      value={newDate?.toDate()}
      timePrecision={'second'}
      fill={true}
      minDate={minDate}
      maxDate={maxDate}
      closeOnSelection={false}
    />
  );

  return (
    <>
      <span className="date-cell-text">{currentDate.format(dateDisplayFormat)}</span>
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
