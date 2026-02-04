import { Config } from './Config';
import { Data, EmptyList, List, Pair } from './dataVisualizerTypes';
import { is_list, is_pair } from './list';

/**
 *  Returns data in text form, fitted into the box.
 *  If not possible to fit data, return undefined. A number will be assigned and logged in the console.
 */
export function toText(data: Data, full: boolean = false): string | undefined {
  if (full) {
    return '' + data;
  } else {
    const type = typeof data;
    if ((type === 'function' || type === 'object') && data !== null) {
      return undefined;
    } else if (type === 'string') {
      const dataString = data + '';
      const str = dataString.substring(0, Config.MaxTextLength);
      return `"${str}${dataString.length > Config.MaxTextLength ? '...' : ''}"`;
    } else {
      return `${data}`;
    }
  }
}

export function isArray(data: Data): data is Array<Data> {
  return Array.isArray(data);
}

export function isFunction(data: Data): data is Function {
  return typeof data === 'function';
}

export function isPair(data: Data): data is Pair {
  return is_pair(data);
}

export function isList(data: Data): data is List {
  return is_list(data);
}

export function isEmptyList(data: Data): data is EmptyList {
  return data === null;
}

export { head, tail } from './list';
