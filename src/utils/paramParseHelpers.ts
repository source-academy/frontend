/*
 * A helper function for parsing possibly optional string parameters 
 * (pasesed by react-router) into integers. A null value is returned
 * if the integer could not be parsed, or if the parameter was undefined.
 */
export const stringParamToInt = (param?: string): number | null => {
  if(param === undefined) {
    return null
  }
  const num: number = parseInt(param, 10)
  return Number.isInteger(num) ? num : null
}
