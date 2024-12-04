import { schemeVisualise } from 'js-slang/dist/alt-langs/scheme/scheme-mapper';
import { _Symbol } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/stdlib/base';
import { SchemeNumber } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/stdlib/core-math';
import { estreeDecode } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/encoder-visitor';
import { unparse } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/reverse_parser';
import { List, Pair } from 'js-slang/dist/stdlib/list';
import { Node } from 'js-slang/dist/types';

import { Continuation } from './scheme';
export { Continuation } from 'js-slang/dist/cse-machine/continuations';

export function isPair(data: any): data is Pair<any, any> {
  return data instanceof Array && data.length === 2;
}

export function isList(data: any): data is List {
  return data === null || (isPair(data) && isList(data[1]));
}

export function isSchemeNumber(data: any): data is SchemeNumber {
  return (data as any)?.numberType !== undefined;
}

export function isSymbol(data: any): data is _Symbol {
  return (data as any)?.sym !== undefined;
}

export function isContinuation(data: any): data is Continuation {
  return (data as any)?.toString() === 'continuation';
}

export function convertNodeToScheme(node: Node): string {
  return unparse(estreeDecode(node as any));
}

export function schemeToString(data: any): string {
  return schemeVisualise(data).toString();
}
