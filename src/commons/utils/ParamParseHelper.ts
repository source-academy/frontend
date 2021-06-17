import { AssessmentCategories, AssessmentCategory } from '../assessment/AssessmentTypes';

/**
 * Converts an AssessmentCategory into a string for use in URLs.
 *
 * Note that there is an exception to the usual logic, for sidequests.
 * Sidequests show up on the frontend as 'Quests' (#295) and the URLs
 * must be represented as such.
 *
 * @param {AssessmentCategory} cat - Any AssessmentCategory, usually
 *   retrieved from the AssessmentCategories enum
 */
export const assessmentCategoryLink = (cat: AssessmentCategory): string =>
  cat === AssessmentCategories.Sidequest ? 'quests' : cat.toLowerCase().concat('s');

export const assessmentTypeLink = (type: string): string => type.toLowerCase().replace(/\W+/g, '_');

/** Converts an optinal string
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
