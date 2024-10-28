import dayjs from 'dayjs';

const now = new Date();

export const isExpired = (deadline?: Date) => deadline !== undefined && deadline <= now;

export const isReleased = (release?: Date) => release === undefined || release <= now;

export const isWithinTimeRange = (fromTime?: Date, toTime?: Date) => {
  // if bounds not specified, return true
  if (fromTime === undefined && toTime === undefined) {
    return true;
  }

  // express times as numbers
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const leftBound =
    fromTime === undefined ? undefined : fromTime.getHours() * 100 + fromTime.getMinutes();
  const rightBound =
    toTime === undefined ? undefined : toTime.getHours() * 100 + toTime.getMinutes();

  if (leftBound === undefined) {
    return currentTime <= rightBound!;
  } else if (rightBound === undefined) {
    return currentTime >= leftBound!;
  } else if (leftBound >= rightBound) {
    // happens when, for example, leftBound = 2300, rightBound = 0100
    return currentTime <= rightBound || currentTime >= leftBound;
  } else {
    return currentTime <= rightBound && currentTime >= leftBound;
  }
};

export const timeFromExpired = (deadline?: Date) =>
  deadline === undefined ? 0 : deadline.getTime() - now.getTime();

export const prettifyDate = (deadline?: Date) => {
  if (deadline === undefined) return '';

  return dayjs(deadline).format('D MMMM YYYY HH:mm');
};

export const prettifyTime = (time?: Date) => {
  if (time === undefined) return '';
  return dayjs(time).format('HH:mm');
};

// Converts Date to deadline countdown
export const prettifyDeadline = (deadline?: Date) => {
  if (deadline === undefined) {
    return 'Unlimited';
  } else if (isExpired(deadline)) {
    return 'Expired';
  }

  const now = dayjs();

  const weeksAway = Math.ceil(dayjs(deadline).diff(now, 'weeks', true));
  const daysAway = Math.ceil(dayjs(deadline).diff(now, 'days', true));
  const hoursAway = Math.ceil(dayjs(deadline).diff(now, 'hours', true));

  let prettifiedDeadline = '';
  if (weeksAway > 1) {
    prettifiedDeadline = weeksAway + ' Weeks';
  } else if (daysAway > 1) {
    prettifiedDeadline = daysAway + ' Days';
  } else if (hoursAway > 1) {
    prettifiedDeadline = hoursAway + ' Hours';
  } else {
    prettifiedDeadline = '1 Hour';
  }

  return prettifiedDeadline;
};
