import { Dialog, DialogBody, DialogFooter, Intent } from '@blueprintjs/core';
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
const dateInputFormat = 'YYYY-MM-DDTHH:mm:ss';

const EditCell: React.FC<Props> = ({ data, forOpenDate, handleAssessmentChangeDate }) => {
  const minDate = dayjs(new Date(2010, 0, 1));
  const maxDate = dayjs(new Date(2030, 11, 31));

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

  const handleDateChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = dayjs(event.target.value);

      if (!selected.isValid()) {
        showWarningMessage('Failed to parse date string! Defaulting to current date.', 2000);
        setNewDate(currentDate);
        return;
      }

      if (selected.isBefore(minDate) || selected.isAfter(maxDate)) {
        showWarningMessage('Date is out of allowed range.', 2000);
        return;
      }

      setNewDate(selected);
    },
    [currentDate, minDate, maxDate]
  );

  const dateInput = (
    <input
      type="datetime-local"
      className="bp6-input"
      value={newDate ? newDate.format(dateInputFormat) : ''}
      onChange={handleDateChange}
      min={minDate.format(dateInputFormat)}
      max={maxDate.format(dateInputFormat)}
      step={1}
      aria-label="Assessment date and time"
    />
  );

  return (
    <>
      <div className="date-cell-content">
        <span className="date-cell-text">{currentDate.format(dateDisplayFormat)}</span>
        <ControlButton icon={IconNames.EDIT} onClick={handleOpenDialog} />
      </div>
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
