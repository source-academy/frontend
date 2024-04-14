import { Data } from '../CseMachineTypes';

/** Returns `true` if `data` is a scheme number
 * TODO: make this less hacky.
 */
export function isSchemeNumber(data: Data): boolean {
  return (data as any)?.numberType !== undefined;
}
