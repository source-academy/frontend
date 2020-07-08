import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementDeadlineProps = {
  deadline?: Date;
};

// Converts Date to user friendly date string
const prettifyDeadline = (deadline: Date | undefined) => {
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

  /* -------- Prettifies Deadline -------- */
  if (deadline === undefined) {
    return 'Unlimited';
  } else if (isExpired(deadline)) {
    return 'Expired';
  }

  const weeksAway = Math.ceil(getWeeksAway(deadline));
  const daysAway = Math.ceil(getDaysAway(deadline));
  const hoursAway = Math.ceil(getHoursAway(deadline));

  let prettifiedDeadline = '';
  if (weeksAway > 1) {
    prettifiedDeadline = weeksAway + ' Weeks';
  } else if (daysAway > 1) {
    prettifiedDeadline = daysAway + ' Days';
  } else if (hoursAway > 1) {
    prettifiedDeadline = hoursAway + ' Hours';
  } else {
    prettifiedDeadline = 'Less than 1 hour';
  }

  return prettifiedDeadline;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline } = props;

  return (
    <div className="deadline">
      <Icon icon={IconNames.STOPWATCH} />
      <p>{prettifyDeadline(deadline)}</p>
    </div>
  );
}

export default AchievementDeadline;
