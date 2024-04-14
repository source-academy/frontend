import { estreeDecode } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/encoder-visitor';
import { unparse } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/reverse_parser';
import { Node } from 'js-slang/dist/types';

import { Data } from '../CseMachineTypes';

/** Returns `true` if `data` is a scheme number
 * TODO: make this less hacky.
 */
export function isSchemeNumber(data: Data): boolean {
  return (data as any)?.numberType !== undefined;
}

export function convertNodeToScheme(node: Node): string {
  return unparse(estreeDecode(node as any));
}
