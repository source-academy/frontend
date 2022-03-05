import { ReferenceType } from '../../EnvVisualizerTypes';
import { FnValue } from './FnValue';

/** this encapsulates a function from the global frame
 * (which has no extra props such as environment or fnName) */
export class GlobalFnValue extends FnValue {
  constructor(
    /** underlying function */
    readonly data: () => any,
    /** what this value is being referenced by */
    readonly referencedBy: ReferenceType[]
  ) {
    super(data, referencedBy);
  }
}
