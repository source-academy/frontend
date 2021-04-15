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

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const day = deadline.getDate();
  const month = months[deadline.getMonth()];
  const year = deadline.getFullYear();
  const hour = deadline.getHours();
  const minute = deadline.getMinutes();
  const time = (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;

  return `${day} ${month} ${year} ${time}`;
};

export const prettifyTime = (time?: Date) => {
  if (time === undefined) return '';
  const hour = time.getHours();
  const minute = time.getMinutes();
  return (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
};

// Converts Date to deadline countdown
export const prettifyDeadline = (deadline?: Date) => {
  /* ---------- Date constants ---------- */
  const daysPerWeek = 7;
  const hoursPerDay = 24;
  const millisecondsPerHour = 3600000;

  /* -------- Helper for Deadline -------- */
  const isExpired = (deadline: Date): boolean => deadline.getTime() <= now.getTime();
  const getHoursAway = (deadline: Date): number =>
    (deadline.getTime() - now.getTime()) / millisecondsPerHour;
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
    prettifiedDeadline = '1 Hour';
  }

  return prettifiedDeadline;
};
