import { AssessmentType } from '../assessment/AssessmentTypes';

/**
 * Converts an AssessmentType into a string for use in URLs.
 */
export const assessmentTypeLink = (assessmentType: AssessmentType): string =>
  assessmentType.toLowerCase().replace(/\W+/g, '_');

/** Converts an optional string
 *  parameter into an integer or null value.
 *
 *  @param {string} str - An optional string to be
 *    converted to an integer.
 */
export const stringParamToInt = (str?: string): number | null => {
  if (str === undefined) {
    return null;
  }
  const num = parseInt(str, 10);
  return Number.isInteger(num) ? num : null;
};
