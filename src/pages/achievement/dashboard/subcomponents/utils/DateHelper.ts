// Start of the week
export const semester1Weeks: Map<number, Date> = new Map([
  [1, new Date(2020, 7, 10, 0, 0, 0)],
  [2, new Date(2020, 7, 17, 0, 0, 0)],
  [3, new Date(2020, 7, 24, 0, 0, 0)],
  [4, new Date(2020, 7, 31, 0, 0, 0)],
  [5, new Date(2020, 8, 7, 0, 0, 0)],
  [6, new Date(2020, 8, 14, 0, 0, 0)],
  [6.5, new Date(2020, 8, 19, 0, 0, 0)], // recess week
  [7, new Date(2020, 8, 28, 0, 0, 0)],
  [8, new Date(2020, 9, 5, 0, 0, 0)],
  [9, new Date(2020, 9, 12, 0, 0, 0)],
  [10, new Date(2020, 9, 19, 0, 0, 0)],
  [11, new Date(2020, 9, 26, 0, 0, 0)],
  [12, new Date(2020, 10, 2, 0, 0, 0)],
  [13, new Date(2020, 10, 9, 0, 0, 0)],
  [14, new Date(2020, 10, 14, 0, 0, 0)], // reading week
  [15.1, new Date(2020, 10, 21, 0, 0, 0)], // exam week 1
  [15.2, new Date(2020, 10, 28, 0, 0, 0)], // exam week 2
  [16, new Date(2020, 11, 6, 0, 0, 0)] // vacation
]);

// Converts Date to user friendly week string
export const prettifyWeek = (date: Date) => {
  let week = 0;
  for (const [key, startOfTheWeek] of semester1Weeks.entries()) {
    if (date < startOfTheWeek) {
      break;
    }
    week = key;
  }
  switch (week) {
    case 6.5:
      return 'Recess Week';
    case 14:
      return 'Reading Week';
    case 15.1:
      return 'Examination Week 1';
    case 15.2:
      return 'Examination Week 2';
    case 16:
      return 'Vacation';
    default:
      return 'Week ' + week;
  }
};

export const prettifyDate = (deadline: Date) => {
  const day = deadline.getDate();
  const year = deadline.getFullYear();

  switch (deadline.getMonth()) {
    case 0:
      return day + ' January ' + year;
    case 1:
      return day + ' February ' + year;
    case 2:
      return day + ' March ' + year;
    case 3:
      return day + ' April ' + year;
    case 4:
      return day + ' May ' + year;
    case 5:
      return day + ' June ' + year;
    case 6:
      return day + ' July ' + year;
    case 7:
      return day + ' August ' + year;
    case 8:
      return day + ' September ' + year;
    case 9:
      return day + ' October ' + year;
    case 10:
      return day + ' November ' + year;
    case 11:
      return day + ' December ' + year;
    default:
      return deadline.toLocaleDateString();
  }
};

// Converts Date to deadline countdown
export const prettifyDeadline = (deadline: Date | undefined) => {
  /* ---------- Date constants ---------- */
  const now = new Date();
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
