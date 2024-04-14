// alternate representations of data types

import { Data } from '../CseMachineTypes';
import { isSchemeNumber } from './scheme';

// used to define custom primitives from alternate languages.
// MAKE SURE the custom primitive has a toString() method!
export function isCustomPrimitive(data: Data): boolean {
  return isSchemeNumber(data);
}
