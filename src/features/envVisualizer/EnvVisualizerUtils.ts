import { Environment } from 'js-slang/dist/types';
import { Group } from 'konva/lib/Group';
import { Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { cloneDeep } from 'lodash';

import { Value as CompactValue } from './compactComponents/values/Value';
import { Binding } from './components/Binding';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { Value } from './components/values/Value';
import EnvVisualizer from './EnvVisualizer';
import { Config } from './EnvVisualizerConfig';
import {
  CompactReferenceType,
  Data,
  EmptyObject,
  Env,
  EnvTree,
  EnvTreeNode,
  FnTypes,
  PrimitiveTypes,
  ReferenceType
} from './EnvVisualizerTypes';

// TODO: can make use of lodash
/** Returns `true` if `x` is an object */
export function isObject(x: any): x is object {
  return x === Object(x);
}

/** Returns `true` if `object` is empty */
export function isEmptyObject(object: Object): object is EmptyObject {
  return Object.keys(object).length === 0;
}

/** Returns `true` if `object` is `Environment` */
export function isEnvironment(object: Object): object is Environment {
  return 'head' in object && 'tail' in object && 'name' in object;
}

/** Returns `true` if `object` is `EnvTreeNode` */
export function isEnvTreeNode(object: Object): object is EnvTreeNode {
  return 'parent' in object && 'children' in object;
}

/** Returns `true` if `object` is `EnvTree` */
export function isEnvTree(object: Object): object is EnvTree {
  return 'root' in object;
}

/** Returns `true` if `env` is empty (that is, head of env is an empty object) */
export function isEmptyEnvironment(env: Env): env is Env & { head: EmptyObject } {
  return env === null || isEmptyObject(env.head);
}

/** Returns `true` if `data` is a Javascript array */
export function isArray(data: Data): data is Data[] {
  return Array.isArray(data);
}

/** Returns `true` if `x` is a Javascript function */
export function isFunction(x: any): x is () => any {
  return x && {}.toString.call(x) === '[object Function]';
}

/** Returns `true` if `data` is a JS Slang function */
export function isFn(data: Data): data is FnTypes {
  return isFunction(data) && 'environment' in data && 'functionName' in data;
}

/** Returns `true` if `x` is a JS Slang function in the global frame */
export function isGlobalFn(x: any): x is () => any {
  return isFunction(x) && !isFn(x);
}

/** Returns `true` if `data` is null */
export function isNull(data: Data): data is null {
  return data === null;
}

/** Returns `true` if `data` is undefined */
export function isUndefined(data: Data): data is undefined {
  return data === undefined;
}

/** Returns `true` if `data` is a string */
export function isString(data: Data): data is string {
  return typeof data === 'string';
}

/** Returns `true` if `data` is a number */
export function isNumber(data: Data): data is number {
  return typeof data === 'number';
}

/** Returns `true` if `data` is a symbol */
export function isUnassigned(data: Data): data is symbol {
  return typeof data === 'symbol';
}

/** Returns `true` if `data` is a boolean */
export function isBoolean(data: Data): data is boolean {
  return typeof data === 'boolean';
}

/** Returns `true` if `data` is a primitive, defined as a null | data | number */
export function isPrimitiveData(data: Data): data is PrimitiveTypes {
  return isUndefined(data) || isNull(data) || isString(data) || isNumber(data) || isBoolean(data);
}

/** Returns `true` if `reference` is the main reference of `value` */
export function isMainReference(value: Value, reference: ReferenceType) {
  if (value instanceof FnValue) {
    // chooses the frame of the enclosing environment, not necessarily the first in referencedBy.
    return (
      reference instanceof Binding &&
      value.enclosingEnvNode === (reference as Binding).frame.envTreeNode &&
      value.referencedBy.findIndex(x => x instanceof Binding && x === reference) !== -1
    );
  } else if (value instanceof GlobalFnValue) {
    return value.referencedBy.find(x => x instanceof Binding) === reference;
  } else {
    return value.referencedBy[0] === reference;
  }
}

/** Returns `true` if `reference` is the main reference of `value` */
export function isCompactMainReference(value: CompactValue, reference: CompactReferenceType) {
  return value.referencedBy[0] === reference;
}

/** checks if `value` is a `number` */
/** Returns `true` if `value` is a `number` */
export function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}

/**
 * Returns `true` if `key` is a dummy key.
 * dummy key is an integral unique id.
 */
export function isDummyKey(key: string) {
  return isNumeric(key);
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {string} text The text to be rendered.
 * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 */
export function getTextWidth(
  text: string,
  font: string = `${Config.FontStyle} ${Config.FontSize}px ${Config.FontFamily}`
): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context || !text) {
    return 0;
  }

  context.font = font;
  const longestLine = text
    .split('\n')
    .reduce<string>(
      (accText, currValue) =>
        context.measureText(accText).width > context.measureText(currValue).width
          ? accText
          : currValue,
      ''
    );
  const metrics = context.measureText(longestLine);
  return metrics.width;
}

/** Returns the parameter string of the given function */
export function getParamsText(data: () => any): string {
  if (isFn(data)) {
    return data.node.params.map((node: any) => node.name).join(',');
  } else {
    const fnString = data.toString();
    return fnString.substring(fnString.indexOf('('), fnString.indexOf('{')).trim();
  }
}

/** Returns the body string of the given function */
export function getBodyText(data: () => any): string {
  const fnString = data.toString();
  if (isFn(data)) {
    let body =
      data.node.type === 'FunctionDeclaration' || fnString.substring(0, 8) === 'function'
        ? fnString.substring(fnString.indexOf('{'))
        : fnString.substring(fnString.indexOf('=') + 3);

    if (body[0] !== '{') body = '{\n  return ' + body + ';\n}';
    return body;
  } else {
    return fnString.substring(fnString.indexOf('{'));
  }
}

export function setHoveredCursor(target: Node | Group) {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'pointer');
}

export function setUnhoveredCursor(target: Node | Group) {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'default');
}

/** Updates the styles of a Konva node and its children on hover, and then redraw the layer */
export function setHoveredStyle(target: Node | Group, hoveredAttrs: any = {}): void {
  const nodes: (Group | Shape | Node)[] =
    target instanceof Group ? Array.from(target.children || []) : [];
  nodes.push(target);
  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke ? Config.HoveredColor.toString() : node.attrs.stroke,
      fill: node.attrs.fill ? Config.HoveredColor.toString() : node.attrs.fill,
      ...hoveredAttrs
    });
  });
}

/** Updates the styles of a Konva node and its children on unhover, and then redraw the layer */
export function setUnhoveredStyle(target: Node | Group, unhoveredAttrs: any = {}): void {
  const nodes: (Group | Shape | Node)[] =
    target instanceof Group ? Array.from(target.children || []) : [];
  nodes.push(target);

  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke
        ? EnvVisualizer.getPrintableMode()
          ? Config.SA_BLUE.toString()
          : Config.SA_WHITE.toString()
        : node.attrs.stroke,
      fill: node.attrs.fill
        ? EnvVisualizer.getPrintableMode()
          ? Config.SA_BLUE.toString()
          : Config.SA_WHITE.toString()
        : node.attrs.fill,
      ...unhoveredAttrs
    });
  });
}

/** Extracts the non-empty tail environment from the given environment */
export function getNonEmptyEnv(environment: Env): Env {
  if (environment === null) {
    return null;
  } else if (isEmptyEnvironment(environment)) {
    return getNonEmptyEnv(environment.tail);
  } else {
    return environment;
  }
}

/**
 * Finds the underlying `Environment` objects and copies property descriptors
 * from source frames to destination frames. Property descriptors are important for us
 * to distinguish between constants and variables.
 */
export function copyOwnPropertyDescriptors(source: any, destination: any) {
  if (isFunction(source) || isPrimitiveData(source)) {
    return;
  }
  if (isEnvTree(source) && isEnvTree(destination)) {
    copyOwnPropertyDescriptors(source.root, destination.root);
  } else if (isEnvTreeNode(source) && isEnvTreeNode(destination)) {
    // recurse only on children and environment
    copyOwnPropertyDescriptors(source.children, destination.children);
    copyOwnPropertyDescriptors(source.environment, destination.environment);
  } else if (isArray(source) && isArray(destination)) {
    // recurse on array items
    source.forEach((item, i) => copyOwnPropertyDescriptors(item, destination[i]));
  } else if (isEnvironment(source) && isEnvironment(destination)) {
    // copy descriptors from source frame to destination frame
    Object.defineProperties(destination.head, Object.getOwnPropertyDescriptors(source.head));
    // recurse on tail
    copyOwnPropertyDescriptors(source.tail, destination.tail);
  }
}

/**
 * Creates a deep clone of `EnvTree`
 *
 * TODO: move this function to EnvTree class
 * so we can invoke like so: environmentTree.deepCopy()
 */
export function deepCopyTree(value: EnvTree): EnvTree {
  const clone = cloneDeep(value);
  copyOwnPropertyDescriptors(value, clone);
  return clone;
}

export function getNextChildren(c: EnvTreeNode): EnvTreeNode[] {
  if (isEmptyEnvironment(c.environment)) {
    const nextChildren: EnvTreeNode[] = [];
    c.children.forEach(gc => {
      nextChildren.push(...getNextChildren(gc as EnvTreeNode));
    });
    return nextChildren;
  } else {
    return [c];
  }
}
