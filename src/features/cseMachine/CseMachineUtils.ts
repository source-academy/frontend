import { estreeDecode } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/encoder-visitor';
import { unparse } from 'js-slang/dist/alt-langs/scheme/scm-slang/src/utils/reverse_parser';
import JsSlangClosure from 'js-slang/dist/cse-machine/closure';
import {
  AppInstr,
  ArrLitInstr,
  AssmtInstr,
  BinOpInstr,
  ControlItem,
  EnvInstr,
  Instr,
  InstrType,
  UnOpInstr
} from 'js-slang/dist/cse-machine/types';
import { Chapter, Environment, Value as StashValue } from 'js-slang/dist/types';
import { astToString } from 'js-slang/dist/utils/ast/astToString';
import { Group } from 'konva/lib/Group';
import { Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { Text } from 'konva/lib/shapes/Text';
import { cloneDeep, isObject } from 'lodash';
import { isSchemeLanguage } from 'src/commons/application/ApplicationTypes';
import classes from 'src/styles/Draggable.module.scss';

import { ArrayUnit } from './components/ArrayUnit';
import { Binding } from './components/Binding';
import { ControlItemComponent } from './components/ControlItemComponent';
import { Frame } from './components/Frame';
import { StashItemComponent } from './components/StashItemComponent';
import { ArrayValue } from './components/values/ArrayValue';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { Value } from './components/values/Value';
import CseMachine from './CseMachine';
import { Config } from './CseMachineConfig';
import { Layout } from './CseMachineLayout';
import {
  BuiltInFn,
  Closure,
  Data,
  DataArray,
  EmptyObject,
  Env,
  EnvTree,
  EnvTreeNode,
  GlobalFn,
  NonGlobalFn,
  PredefinedFn,
  Primitive,
  ReferenceType,
  SourceObject,
  StreamFn,
  Unassigned
} from './CseMachineTypes';
import {
  getAlternateControlItemComponent,
  isCustomPrimitive,
  needsNewRepresentation
} from './utils/altLangs';
class AssertionError extends Error {
  constructor(msg?: string) {
    super(msg);
    this.name = 'AssertionError';
  }
}

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) throw new AssertionError(msg);
}

/** Returns `true` if `object` is empty */
export function isEmptyObject(object: object): object is EmptyObject {
  return Object.keys(object).length === 0;
}

/** Returns `true` if `x` is a source object, e.g. runes */
export function isSourceObject(x: any): x is SourceObject {
  return isObject(x) && 'toReplString' in x && isFunction(x.toReplString);
}

/** Returns `true` if `object` is `Environment` */
export function isEnvironment(object: object): object is Environment {
  return 'head' in object && 'tail' in object && 'name' in object;
}

/** Returns `true` if `object` is `EnvTreeNode` */
export function isEnvTreeNode(object: object): object is EnvTreeNode {
  return 'parent' in object && 'children' in object;
}

/** Returns `true` if `object` is `EnvTree` */
export function isEnvTree(object: object): object is EnvTree {
  return 'root' in object;
}

/** Returns `true` if `env` is empty (that is, head of env is an empty object) */
export function isEmptyEnvironment(env: Env): env is Env & { head: EmptyObject } {
  return env === null || isEmptyObject(env.head);
}

/** Returns `true` if `data` is an array */
export function isArray(data: any): data is any[] {
  return Array.isArray(data);
}

/** Returns `true` if `data` is a JS Slang array with properties `id` and `environment` */
export function isDataArray(data: any): data is DataArray {
  return (
    isArray(data) &&
    {}.hasOwnProperty.call(data, 'id') &&
    {}.hasOwnProperty.call(data, 'environment')
  );
}

/** Returns `true` if `x` is a Javascript function */
export function isFunction(x: any): x is Function {
  return x && {}.toString.call(x) === '[object Function]';
}

/** Returns `true` if `data` is a built-in function */
export function isBuiltInFn(data: Data): data is BuiltInFn {
  // Extra `environment` check for functions returned from `stream`
  // TODO: remove if `stream` becomes a pre-defined function
  return isFunction(data) && !isClosure(data) && !{}.hasOwnProperty.call(data, 'environment');
}

/** Returns `true` if `data` is a pre-defined function */
export function isPredefinedFn(data: Data): data is PredefinedFn {
  return isClosure(data) && data.predefined;
}

const closureFields = ['id', 'environment', 'functionName', 'predefined', 'node', 'originalNode'];

/** Returns `true` if `data` is a JS Slang closure */
export function isClosure(data: Data): data is Closure {
  const obj = {};
  return (
    data instanceof JsSlangClosure ||
    (isFunction(data) &&
      closureFields.reduce((prev, field) => prev && obj.hasOwnProperty.call(data, field), true))
  );
}

/**
 * Returns `true` if `data` is a function returned from calling `stream`.
 * TODO: remove if `stream` becomes a pre-defined function
 */
export function isStreamFn(data: Data): data is StreamFn {
  return isFunction(data) && !isClosure(data) && {}.hasOwnProperty.call(data, 'environment');
}

/** Returns `true` if `data` is a function that is built-in or pre-defined */
export function isGlobalFn(data: Data): data is GlobalFn {
  return isBuiltInFn(data) || isPredefinedFn(data);
}

/**
 * Returns `true` if `data` is **not** a function that is built-in or pre-defined.
 * In other words, it is either a closure that is not predefined, or a stream function.
 *
 * TODO: remove checking for `isStreamFn` if `stream` becomes pre-defined
 */
export function isNonGlobalFn(data: Data): data is NonGlobalFn {
  return (isClosure(data) && !isPredefinedFn(data)) || isStreamFn(data);
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
export function isUnassigned(data: Data): data is Unassigned {
  return typeof data === 'symbol';
}

/** Returns `true` if `data` is a boolean */
export function isBoolean(data: Data): data is boolean {
  return typeof data === 'boolean';
}

/** Returns `true` if `data` is a primitive, which are non-reference types and source objects */
export function isPrimitiveData(data: Data): data is Primitive {
  return (
    isUndefined(data) ||
    isNull(data) ||
    isString(data) ||
    isNumber(data) ||
    isBoolean(data) ||
    isSourceObject(data) ||
    isCustomPrimitive(data)
  );
}

// TODO: remove this in the future once ES typings are updated to contain the new set functions
type ExtendedSet<T> = Set<T> & {
  difference(other: Set<T>): Set<T>;
};

/** Returns a set with the elements in `set1` that are not in `set2` */
export function setDifference<T>(set1: Set<T>, set2: Set<T>) {
  if ('difference' in Set.prototype) {
    return (set1 as ExtendedSet<T>).difference(set2);
  } else {
    const result = new Set<T>();
    for (const item of set1) {
      if (!set2.has(item)) result.add(item);
    }
    return result;
  }
}

/**
 * Returns `true` if `reference` is the main reference of `value`. The main reference priority
 * order is the first binding or array unit which shares the same environment with `value`.
 *
 * An exception is for a global function value, in which case the global frame binding is
 * always prioritised over array units.
 */
export function isMainReference(value: Value, reference: ReferenceType) {
  if (isGlobalFn(value.data)) {
    return (
      reference instanceof Binding &&
      isEnvEqual(reference.frame.environment, Layout.globalEnvNode.environment)
    );
  }
  if (!isNonGlobalFn(value.data) && !isDataArray(value.data)) {
    return true;
  }
  const valueEnv = value.data.environment;
  const mainReference = value.references.find(r =>
    isEnvEqual(r instanceof ArrayUnit ? r.parent.data.environment : r.frame.environment, valueEnv)
  );
  return reference === mainReference;
}

/**
 * Returns `true` if `reference` is a dummy reference,
 * i.e. it is a dummy binding, or the reference is from an array which is unreferenced
 */
export function isDummyReference(reference: ReferenceType) {
  return (
    (reference instanceof Binding && reference.isDummyBinding) ||
    (reference instanceof ArrayUnit && !reference.parent.isReferenced())
  );
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

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

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
  return Math.round(metrics.width);
}

/**
 * Uses canvas.measureText to compute and return the height of the text box
 * given its font in pixels.
 *
 * @param {string} text The text to be rendered.
 * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * @param {number} fontSize The size of the font.
 * @param {number} width The width of the textbox the text will be rendered in.
 */
export function getTextHeight(
  text: string,
  width: number,
  font: string = `${Config.FontStyle} ${Config.FontSize}px ${Config.FontFamily}`,
  fontSize: number = Config.FontSize
): number {
  if (!context || !text) {
    return 0;
  }

  context.font = font;
  const numberOfLines = text
    .split('\n')
    .map(s => context.measureText(s).width)
    .reduce<number>((accLines, currWidth) => accLines + Math.ceil(currWidth / width), 0);
  return numberOfLines * fontSize;
}

/** Returns the parameter string of the given function, surrounded by brackets */
export function getParamsText(data: Closure | GlobalFn | StreamFn): string {
  if (isClosure(data)) {
    let params = data.functionName.slice(0, data.functionName.indexOf('=>')).trim();
    if (!params.startsWith('(')) params = '(' + params + ')';
    return params;
  } else {
    const fnString = data.toString();
    return fnString.substring(fnString.indexOf('('), fnString.indexOf(')') + 1);
  }
}

/** Returns the body string of the given function */
export function getBodyText(data: Closure | GlobalFn | StreamFn): string {
  const fnString = data.toString();
  if (isClosure(data)) {
    let body =
      fnString.substring(0, 8) === 'function'
        ? fnString.substring(fnString.indexOf('{'))
        : fnString.substring(fnString.indexOf('=') + 3);

    if (body[0] !== '{') body = '{\n  return ' + body + ';\n}';
    return body;
  } else if (isStreamFn(data)) {
    // TODO: remove if `stream` becomes pre-defined
    return '{\n  [implementation hidden]\n}';
  } else {
    return fnString.substring(fnString.indexOf('{'));
  }
}

export function setHoveredCursor(target: Node | Group) {
  const container = target.getStage()?.container();
  if (container) {
    container.classList.remove(classes['draggable']);
    container.classList.add(classes['clickable']);
  }
}

export function setUnhoveredCursor(target: Node | Group) {
  const container = target.getStage()?.container();
  if (container) {
    container.classList.remove(classes['clickable']);
    container.classList.add(classes['draggable']);
  }
}

/** Updates the styles of a Konva node and its children on hover, and then redraw the layer */
export function setHoveredStyle(target: Node | Group, hoveredAttrs: any = {}): void {
  const nodes: (Group | Shape | Node)[] =
    target instanceof Group ? Array.from(target.children || []) : [];
  nodes.push(target);
  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke ? Config.HoverColor : node.attrs.stroke,
      fill: node.attrs.fill ? Config.HoverColor : node.attrs.fill,
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
        ? node instanceof Text
          ? defaultTextColor()
          : defaultStrokeColor()
        : node.attrs.stroke,
      fill: node.attrs.fill
        ? node instanceof Text
          ? defaultTextColor()
          : defaultStrokeColor()
        : node.attrs.fill,
      ...unhoveredAttrs
    });
  });
}

/**
 * Extracts the non-empty tail environment from the given environment.
 * Returns the current environment if the tail is null.
 */
export function getNonEmptyEnv(environment: Env): Env {
  if (isEmptyEnvironment(environment)) {
    if (environment.tail === null) {
      return environment;
    }
    return getNonEmptyEnv(environment.tail);
  } else {
    return environment;
  }
}

/** Returns whether the given environments `env1` and `env2` refer to the same environment. */
export function isEnvEqual(env1: Env, env2: Env): boolean {
  // Cannot check env references because of deep cloning and the step after where
  // property descriptors are copied over, so can only check id
  return env1.id === env2.id;
}

/**
 * Recursively finds all objects in the given array and nested ones that are in the given
 * environment, and adds them to the given set.
 */
function findObjects(
  environment: Env,
  set: Set<DataArray | Closure>,
  array: any[],
  visited = new Set<any[]>() // needed to track circular references
): void {
  if (visited.has(array)) return;
  visited.add(array);
  for (const item of array) {
    if (isDataArray(item) || isClosure(item)) {
      if (isEnvEqual(item.environment, environment)) {
        set.add(item);
        if (isDataArray(item)) findObjects(environment, set, item, visited);
      }
    }
  }
}

/**
 * Get the set of all objects in the heap of the given environment that are
 * referenced in the head.
 */
export function getReferencedObjects(environment: Env): Set<DataArray | Closure> {
  const objects = new Set<DataArray | Closure>();
  findObjects(environment, objects, Object.values(environment.head));
  return objects;
}

/**
 * Get the set of all objects in the heap of the given environment that are **not**
 * referenced in the head. (Note that these objects can still be referenced from other
 * environments, just not the given one.)
 */
export function getUnreferencedObjects(environment: Env): Set<DataArray | Closure> {
  return setDifference(environment.heap.getHeap(), getReferencedObjects(environment));
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
    // TODO: revisit this approach of copying the raw values and descriptors from source,
    // as this defeats the purpose of deep cloning by referencing the original values again.
    // Perhaps, there should be a new deep cloning function that also clones property descriptors.

    // copy descriptors from source frame to destination frame
    Object.defineProperties(destination.head, Object.getOwnPropertyDescriptors(source.head));
    // copy heap from source frame to destination frame as well, to preserve references
    destination.heap = source.heap;
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

export const truncateText = (programStr: string, maxWidth: number, maxHeight: number): string => {
  // Truncate so item component looks like a square
  // Add ellipsis for each line if needed
  let lines = programStr.split('\n').map(line => {
    if (getTextWidth(line) <= maxWidth) {
      return line;
    }
    let truncatedLine = line;
    while (getTextWidth(truncatedLine + Config.Ellipsis) > maxWidth) {
      truncatedLine = truncatedLine.slice(0, -1);
    }
    return truncatedLine + Config.Ellipsis;
  });

  // Add ellipsis for entire code block if needed
  if (getTextHeight([...lines, Config.Ellipsis].join('\n'), maxWidth) <= maxHeight) {
    return lines.join('\n');
  }
  while (getTextHeight([...lines, Config.Ellipsis].join('\n'), maxWidth) > maxHeight) {
    lines = lines.slice(0, -1);
  }
  return [...lines, Config.Ellipsis].join('\n');
};

/**
 * Typeguard for Instr to distinguish between program statements and instructions.
 * The typeguard from js-slang cannot be used due to Typescript raising some weird errors
 * with circular dependencies so it is redefined here.
 *
 * @param command A ControlItem
 * @returns true if the ControlItem is an instruction and false otherwise.
 */
export const isInstr = (command: ControlItem): command is Instr => {
  return (command as Instr).instrType !== undefined;
};

export function getControlItemComponent(
  controlItem: ControlItem,
  stackHeight: number,
  index: number,
  highlightOnHover: () => void,
  unhighlightOnHover: () => void,
  chapter: Chapter
): ControlItemComponent {
  const topItem = CseMachine.getStackTruncated()
    ? index === Math.min(Layout.control.size() - 1, 9)
    : index === Layout.control.size() - 1;
  if (!isInstr(controlItem)) {
    // there's no reason to provide an alternate representation
    // for a instruction.
    if (needsNewRepresentation(chapter)) {
      return getAlternateControlItemComponent(
        controlItem,
        stackHeight,
        highlightOnHover,
        unhighlightOnHover,
        topItem,
        chapter
      );
    }

    if (isSchemeLanguage(chapter)) {
      // use the js-slang decoder on the control item
      controlItem = estreeDecode(controlItem as any);
      const text = unparse(controlItem as any);
      return new ControlItemComponent(
        text,
        text,
        stackHeight,
        highlightOnHover,
        unhighlightOnHover,
        topItem
      );
    }
    switch (controlItem.type) {
      case 'Program':
        // If the control item is the whole program
        // add {} to represent the implicit block
        const originalText = astToString(controlItem)
          .trim()
          .split('\n')
          .map(line => `\t\t${line}`)
          .join('\n');
        const textP = `{\n${originalText}\n}`;
        return new ControlItemComponent(
          textP,
          textP,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case 'Literal':
        const textL =
          typeof controlItem.value === 'string' ? `"${controlItem.value}"` : controlItem.value;
        return new ControlItemComponent(
          textL,
          String(textL),
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      default:
        const text = astToString(controlItem).trim();
        return new ControlItemComponent(
          text,
          text,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
    }
  } else {
    switch (controlItem.instrType) {
      case InstrType.RESET:
        return new ControlItemComponent(
          'return',
          'Skip control items until marker instruction is reached',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.WHILE:
        return new ControlItemComponent(
          'while',
          'Keep executing while loop body if predicate holds',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.FOR:
        return new ControlItemComponent(
          'for',
          'Keep executing for loop body if predicate holds',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.ASSIGNMENT:
        const assmtInstr = controlItem as AssmtInstr;
        return new ControlItemComponent(
          `asgn ${assmtInstr.symbol}`,
          `Assign value on top of stash to ${assmtInstr.symbol}`,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.UNARY_OP:
        const unOpInstr = controlItem as UnOpInstr;
        return new ControlItemComponent(
          unOpInstr.symbol,
          `Perform ${unOpInstr.symbol} on top stash value`,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.BINARY_OP:
        const binOpInstr = controlItem as BinOpInstr;
        return new ControlItemComponent(
          binOpInstr.symbol,
          `Perform ${binOpInstr.symbol} on top 2 stash values`,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.POP:
        return new ControlItemComponent(
          'pop',
          'Pop most recently pushed value from stash',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.APPLICATION:
        const appInstr = controlItem as AppInstr;
        return new ControlItemComponent(
          `call ${appInstr.numOfArgs}`,
          `Call function with ${appInstr.numOfArgs} argument${appInstr.numOfArgs === 1 ? '' : 's'}`,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.BRANCH:
        return new ControlItemComponent(
          'branch',
          'Pop boolean value from stash and execute corresponding branch',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.ENVIRONMENT:
        const envInstr = controlItem as EnvInstr;
        return new ControlItemComponent(
          'env',
          'Set current environment to this environment',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem,
          Layout.levels.reduce<Frame | undefined>(
            (accum, level) =>
              accum
                ? accum
                : level.frames.find(frame => frame.environment?.id === getEnvId(envInstr.env)),
            undefined
          )
        );
      case InstrType.ARRAY_LITERAL:
        const arrayLiteralInstr = controlItem as ArrLitInstr;
        const arity = arrayLiteralInstr.arity;
        return new ControlItemComponent(
          `arr lit ${arity}`,
          `Create array using ${arity} value${arity === 1 ? '' : 's'} on stash`,
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.ARRAY_ACCESS:
        return new ControlItemComponent(
          'arr acc',
          'Access array at given index',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.ARRAY_ASSIGNMENT:
        return new ControlItemComponent(
          'arr asgn',
          'Assign new value to array at given index',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.ARRAY_LENGTH:
        return new ControlItemComponent(
          'arr len',
          'Obtain array length',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.CONTINUE_MARKER:
        return new ControlItemComponent(
          'cont mark',
          'Mark end of loop body',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.BREAK:
        return new ControlItemComponent(
          'break',
          'Control items until break marker will be skipped',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.BREAK_MARKER:
        return new ControlItemComponent(
          'brk mark',
          'Mark end of all loop-associated statements and instructions',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      case InstrType.MARKER:
        return new ControlItemComponent(
          'mark',
          'Mark return address',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
      default:
        return new ControlItemComponent(
          'INSTRUCTION',
          'INSTRUCTION',
          stackHeight,
          highlightOnHover,
          unhighlightOnHover,
          topItem
        );
    }
  }
}

export function getStashItemComponent(
  stashItem: StashValue,
  stackHeight: number,
  index: number,
  _chapter: Chapter
): StashItemComponent {
  let arrowTo: ArrayValue | FnValue | GlobalFnValue | undefined;
  if (isFunction(stashItem) || isDataArray(stashItem)) {
    if (isClosure(stashItem) || isDataArray(stashItem)) {
      arrowTo = Layout.values.get(stashItem.id) as ArrayValue | FnValue;
    } else {
      arrowTo = Layout.values.get(stashItem) as FnValue | GlobalFnValue;
    }
  }
  return new StashItemComponent(stashItem, stackHeight, index, arrowTo);
}

// Helper function to get environment ID. Accounts for the hidden prelude environment right
// after the global environment. Does not need to be used for frame environments, only for
// environments from the context.
export const getEnvId = (environment: Environment): string => {
  return environment.name === 'prelude' ? environment.tail!.id : environment.id;
};

// Function that returns whether the stash item will be popped off in the next step
export const isStashItemInDanger = (stashIndex: number): boolean => {
  const controlItem = Layout.control.peek();
  if (controlItem && isInstr(controlItem)) {
    switch (controlItem.instrType) {
      case InstrType.WHILE:
      case InstrType.FOR:
      case InstrType.UNARY_OP:
      case InstrType.POP:
      case InstrType.BRANCH:
        return Layout.stashComponent.stashItemComponents.length - stashIndex <= 1;
      case InstrType.BINARY_OP:
      case InstrType.ARRAY_ACCESS:
        return Layout.stashComponent.stashItemComponents.length - stashIndex <= 2;
      case InstrType.ARRAY_ASSIGNMENT:
        return Layout.stashComponent.stashItemComponents.length - stashIndex <= 3;
      case InstrType.APPLICATION:
        return (
          Layout.stashComponent.stashItemComponents.length - stashIndex <=
          (controlItem as AppInstr).numOfArgs + 1
        );
      case InstrType.ARRAY_LITERAL:
        return (
          Layout.stashComponent.stashItemComponents.length - stashIndex <=
          (controlItem as ArrLitInstr).arity
        );
    }
  }
  return false;
};

export const defaultBackgroundColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintBgColor : Config.BgColor;

export const defaultTextColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintTextColor : Config.TextColor;

export const fadedTextColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintTextColorFaded : Config.TextColorFaded;

export const defaultStrokeColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintStrokeColor : Config.StrokeColor;

export const fadedStrokeColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintStrokeColorFaded : Config.StrokeColorFaded;

export const defaultActiveColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintActiveColor : Config.ActiveColor;

export const defaultDangerColor = () =>
  CseMachine.getPrintableMode() ? Config.PrintDangerColor : Config.DangerColor;
