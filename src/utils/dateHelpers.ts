/**
 * Checks if a date is before or at the current time.
 *
 * @param {string} date - Current date, in a parsable string format
 *   e.g 2018-07-06T10:20:09.961Z
 * @returns {boolean} true if the date specified by the paramter
 *   is before the time of execution of this function.
 */
export const beforeNow = (date: string): boolean => {
  const paramDate = new Date(date)
  const now = new Date()
  return paramDate <= now
}