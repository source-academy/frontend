import { Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';
import { DateInput3 } from '@blueprintjs/datetime2';
import { IconNames } from '@blueprintjs/icons';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';
import { showWarningMessage } from '../../../../commons/utils/notifications/NotificationsHelper';

type Props = {
  handleAssessmentChangeDate: (id: number, openAt: string, closeAt: string) => void;
  data: AssessmentOverview;
  forOpenDate: boolean;
};

const dateDisplayFormat = 'YYYY-MM-DD HH:mm:ss ZZ';

const EditCell: React.FC<Props> = ({ data, forOpenDate, handleAssessmentChangeDate }) => {
  const minDate = new Date(2010, 0, 0);
  const maxDate = new Date(2030, 11, 31);

  const currentDateString = forOpenDate ? data.openAt : data.closeAt;
  const currentDate = dayjs(currentDateString, undefined, true);

  const [isDialogOpen, setDialogState] = useState(false);
  const [newDate, setNewDate] = useState<dayjs.Dayjs | null>(currentDate);

  const handleOpenDialog = useCallback(() => setDialogState(true), []);
  const handleCloseDialog = useCallback(() => setDialogState(false), []);

  const handleUpdateDate = useCallback(() => {
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
    const date = dayjs(str, dateDisplayFormat, true);
    return date.isValid() ? date.toDate() : false;
  };
  const handleFormatDate = (date: Date) => dayjs(date).format(dateDisplayFormat);

  const handleDateChange = React.useCallback(
    (selectedDate: string | null) => setNewDate(dayjs(selectedDate)),
    []
  );
  const handleDateError = React.useCallback(() => {
    // Reset date to current date if user enters an invalid date string
    showWarningMessage('Failed to parse date string! Defaulting to current date.', 2000);
    setNewDate(currentDate);
  }, [currentDate]);

  const dateInput = (
    <DateInput3
      formatDate={handleFormatDate}
      onChange={handleDateChange}
      onError={handleDateError}
      parseDate={handleParseDate}
      placeholder={`${dateDisplayFormat} or select a date`}
      value={newDate?.toISOString()}
      disableTimezoneSelect
      timePrecision="second"
      fill
      minDate={minDate}
      maxDate={maxDate}
      closeOnSelection={false}
    />
  );

  return (
    <>
      <span className="date-cell-text">{currentDate.format(dateDisplayFormat)}</span>
      <ControlButton icon={IconNames.EDIT} onClick={handleOpenDialog} />
      <Dialog
        icon={IconNames.INFO_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Updating assessment settings"
        canOutsideClickClose={true}
      >
        <DialogBody>
          <p>{forOpenDate ? 'Opening' : 'Closing'} date and time:</p>
          {dateInput}
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
                icon={IconNames.TICK}
                onClick={handleUpdateDate}
                options={{ minimal: false, intent: Intent.DANGER }}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
};

export default EditCell;
