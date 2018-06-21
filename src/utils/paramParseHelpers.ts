import { AssessmentCategory } from '../components/assessment/assessmentShape'

/*
 * Converts an AssessmentCategory into a string for use in URLs.
 * E.g Mission -> missions
 */
export const assessmentCategoryLink = (cat: AssessmentCategory): string => cat.toLowerCase().concat('s')

/* Converts an optinal string parameter into an integer or null value. */
export const stringParamToInt = (str?: string): number | null => {
  if(str === undefined) {
    return null
  } 
  const num = parseInt(str, 10)
  return Number.isInteger(num) 
    ? num
    : null
}