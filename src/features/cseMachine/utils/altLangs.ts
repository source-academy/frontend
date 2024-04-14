// alternate representations of data types

import { Data } from '../CseMachineTypes';

/** Returns `true` if `data` is a scheme number
 * TODO: make this less hacky.
 */
function isSchemeNumber(data: Data): boolean {
  return (data as any)?.numberType !== undefined;
}

// used to define custom primitives from alternate languages.
// MAKE SURE the custom primitive has a toString() method!
export function isCustomPrimitive(data: Data): boolean {
  return isSchemeNumber(data);
}
