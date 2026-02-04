import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

/**
 * Checks if a date is before or at the current time.
 *
 * @param {string} d an ISO 8601 compliant date string
 *   e.g 2018-07-06T10:20:09.961Z
 * @returns {boolean} true if the date specified by the paramter
 *   is before the time of execution of this function.
 */
export const beforeNow = (dateString: string): boolean => {
  const date = dayjs(dateString);
  const now = dayjs();
  return date.isBefore(now);
};

/**
 * Return a string representation of a date that is
 * nice to look at. To be used for displaying the date,
 * e.g when showing the assessment overview.
 *
 * @param {string} d an ISO 8601 compliant date string
 *   e.g 2018-07-06T10:20:09.961Z
 * @returns {string} A user-friendly readable date string,
 *   e.g 7th June, 20:09
 */
export const getPrettyDate = (dateString: string): string => {
  const date = dayjs(dateString);
  const prettyDate = date.format('Do MMMM, HH:mm');
  return prettyDate;
};

export const getStandardDateTime = (dateString: string): string => {
  const date = dayjs(dateString);
  const prettyDate = date.format('MMMM Do YYYY, HH:mm');
  return prettyDate;
};

export const getStandardDate = (dateString: string): string => {
  const date = dayjs(dateString);
  const prettyDate = date.format('MMMM Do YYYY');
  return prettyDate;
};

export const getPrettyDateAfterHours = (dateString: string, hours: number): string => {
  const date = dayjs(dateString).add(hours, 'hours');
  const absolutePrettyDate = date.format('Do MMMM, HH:mm');
  const relativePrettyDate = date.fromNow();
  return `${absolutePrettyDate} (${relativePrettyDate})`;
};
