import { head, is_list, is_pair } from "./list";
import { Data, EmptyList, List, Pair } from "./ListVisualizerTypes";

/**
 *  Returns data in text form, fitted into the box.
 *  If not possible to fit data, return undefined. A number will be assigned and logged in the console.
 */
export function toText(data: any, full: boolean = false): string | undefined {
    if (full) {
        return '' + data;
    } else {
        const type = typeof data;
        if (type === 'function' || type === 'object') {
            return undefined;
        } else if (type === "string") {
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

let nodeLabel = 0;

export function displaySpecialContent(value: string): number {
    // if (typeof display === 'function') {
    //     display('*' + nodeLabel + ': ' + value);
    // } else {
    console.log('*' + nodeLabel + ': ' + value);
    // }
    return nodeLabel++;
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

export function isNull(data: Data): data is EmptyList {
    return data === null;
}

export { head, tail } from './list'