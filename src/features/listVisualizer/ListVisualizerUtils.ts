import { is_list, is_pair } from './list';
import { Data, EmptyList, List, Pair } from './ListVisualizerTypes';

/**
 *  Returns data in text form, fitted into the box.
 *  If not possible to fit data, return undefined. A number will be assigned and logged in the console.
 */
export function toText(data: Data, full: boolean = false): string | undefined {
  if (full) {
    return '' + data;
  } else {
    const type = typeof data;
    if (type === 'function' || type === 'object') {
      return undefined;
    } else if (type === 'string') {
      const str = '' + data;
      if (str.length > 5) {
        return undefined;
      } else {
        return '"' + str + '"';
      }
    } else {
      return '' + data;
    }
  }
}

/**
 * Find the height of a drawing (in number of "rows" of pairs)
 */
export function findDataHeight(data: Data): number {
  // Store pairs/arrays that were traversed previously so as to not double-count their height.
  const existing: Data[] = [];

  function helper(data: Data): number {
    if ((!isPair(data) && !isFunction(data)) || isEmptyList(data)) {
      return 0;
    } else {
      let leftHeight;
      let rightHeight;
      if (existing.includes(data[0]) || (!isPair(data[0]) && !isFunction(data[0]))) {
        leftHeight = 0;
      } else {
        existing.push(data[0]);
        leftHeight = helper(data[0]);
      }
      if (existing.includes(data[1]) || (!isPair(data[1]) && !isFunction(data[1]))) {
        rightHeight = 0;
      } else {
        existing.push(data[1]);
        rightHeight = helper(data[1]);
      }
      return leftHeight > rightHeight ? 1 + leftHeight : 1 + rightHeight;
    }
  }

  return helper(data);
}

/**
 * Find the width of a drawing (in number of "columns" of pairs)
 */
export function findDataWidth(data: Data): number {
  const existing: Data[] = [];

  function helper(data: Data): number {
    if ((!isPair(data) && !isFunction(data)) || isEmptyList(data)) {
      return 0;
    } else {
      let leftWidth: number;
      let rightWidth: number;
      if (existing.includes(data[0]) || (!isPair(data[0]) && !isFunction(data[0]))) {
        leftWidth = 0;
      } else {
        existing.push(data[0]);
        leftWidth = helper(data[0]);
      }
      if (existing.includes(data[1]) || (!isPair(data[1]) && !isFunction(data[1]))) {
        rightWidth = 0;
      } else {
        existing.push(data[1]);
        rightWidth = helper(data[1]);
      }
      return leftWidth + rightWidth + 1;
    }
  }

  return helper(data);
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
