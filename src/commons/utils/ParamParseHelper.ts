import { AssessmentType } from '../assessment/AssessmentTypes';

/**
 * Converts an AssessmentType into a string for use in URLs.
 */
export const assessmentTypeLink = (assessmentType: AssessmentType): string =>
  assessmentType.toLowerCase().replace(/\W+/g, '_');

/**
 * Converts a string parameter into an integer.
 * Returns null if the string parameter is undefined.
 *
 * @param param The parameter to convert to an integer.
 */
export const convertParamToInt = (param?: string): number | null => {
  if (param === undefined) {
    return null;
  }
  const num = parseInt(param, 10);
  return Number.isInteger(num) ? num : null;
};

/**
 * Converts a string parameter into a boolean.
 * Returns null if the string parameter is undefined.
 *
 * @param param The parameter to convert to a boolean.
 */
export const convertParamToBoolean = (param?: string): boolean | null => {
  if (param === undefined) {
    return null;
  }
  return param.toLowerCase() === 'true';
};
