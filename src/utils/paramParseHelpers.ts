import { AssessmentCategory } from '../components/assessment/assessmentShape'

/**
 * Converts an AssessmentCategory into a string for use in URLs.
 *
 * @param {AssessmentCategory} cat - Any AssessmentCategory, usually
 *   retrieved from the AssessmentCategories enum
 */
export const assessmentCategoryLink = (cat: AssessmentCategory): string =>
  cat.toLowerCase().concat('s')

/** Converts an optinal string
 *  parameter into an integer or null value.
 *
 *  @param {string} str - An optional string to be
 *    converted to an integer.
 */
export const stringParamToInt = (str?: string): number | null => {
  if (str === undefined) {
    return null
  }
  const num = parseInt(str, 10)
  return Number.isInteger(num) ? num : null
}
