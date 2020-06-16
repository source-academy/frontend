import React, { useState } from 'react';
import { Icon, Button, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { DatePicker } from '@blueprintjs/datetime';

type AchievementDeadlineProps = {
  deadline?: Date;
  changeDeadline?: any;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline, changeDeadline } = props;
  const [isOpen, setOpen] = useState<boolean>(false);

  /* ---------- Date constants ---------- */
  const daysPerWeek = 7;
  const hoursPerDay = 24;
  const millisecondsPerHour = 3600000;

  /* -------- Helper for Deadline -------- */
  const isExpired = (deadline: Date): boolean => deadline.getTime() < new Date().getTime();
  const getHoursAway = (deadline: Date): number =>
    (deadline.getTime() - new Date().getTime()) / millisecondsPerHour;
  const getDaysAway = (deadline: Date): number => getHoursAway(deadline) / hoursPerDay;
  const getWeeksAway = (deadline: Date): number => getDaysAway(deadline) / daysPerWeek;

  // Converts Date to user friendly date string
  const prettifyDeadline = (deadline: Date | undefined) => {
    if (deadline === undefined) {
      return '';
    } else if (isExpired(deadline)) {
      return 'Expired';
    }

    const weeksAway = Math.ceil(getWeeksAway(deadline));
    const daysAway = Math.ceil(getDaysAway(deadline));
    const hoursAway = Math.ceil(getHoursAway(deadline));

    if (weeksAway > 1) {
      return weeksAway + ' Weeks';
    } else if (daysAway > 1) {
      return daysAway + ' Days';
    } else if (hoursAway > 1) {
      return hoursAway + ' Hours';
    } else {
      return 'Less than 1 hour';
    }
  };

  return (
    <>
      {deadline === undefined ? null : (
        <div className="deadline">
          {changeDeadline === undefined ? (
            <>
              <Icon icon={IconNames.STOPWATCH} />
              <p>{prettifyDeadline(deadline)}</p>
            </>
          ) : (
            <>
              <div>
                <Button onClick={() => setOpen(!isOpen)}>
                  <Icon icon={IconNames.STOPWATCH} />
                  <p>{prettifyDeadline(deadline)}</p>
                </Button>
              </div>
              <div>
                <Dialog
                  onClose={() => setOpen(!isOpen)}
                  isOpen={isOpen}
                  title="Edit Achievement Deadline"
                >
                  <DatePicker
                    timePickerProps={{ showArrowButtons: true }}
                    value={deadline}
                    onChange={changeDeadline}
                  />
                </Dialog>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default AchievementDeadline;

/*
   <div>
          <Button onClick={() => setOpen(!isOpen)} text={isOpen.toString()}> </Button>
        </div>
        <div>
          <Dialog 
            onClose={() => setOpen(!isOpen)} 
            isOpen={isOpen} 
            title="About"
          >
            <DatePicker
              timePickerProps={{ showArrowButtons: true }}
              value={deadline}
              onChange={changeDeadline}
            />

          </Dialog>
        </div>
*/
