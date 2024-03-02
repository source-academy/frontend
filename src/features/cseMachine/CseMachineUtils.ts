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
import { Environment, Value as StashValue } from 'js-slang/dist/types';
import { astToString } from 'js-slang/dist/utils/astToString';
import { Group } from 'konva/lib/Group';
import { Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { cloneDeep } from 'lodash';
import classes from 'src/styles/Draggable.module.scss';

import { ControlItemComponent } from './compactComponents/ControlItemComponent';
import { Frame } from './compactComponents/Frame';
import { StashItemComponent } from './compactComponents/StashItemComponent';
import { ArrayValue } from './compactComponents/values/ArrayValue';
import { Value as CompactValue } from './compactComponents/values/Value';
import { Binding } from './components/Binding';
import { FnValue } from './components/values/FnValue';
import { GlobalFnValue } from './components/values/GlobalFnValue';
import { Value } from './components/values/Value';
import CseMachine from './CseMachine';
import { CompactConfig } from './CseMachineCompactConfig';
import { Config } from './CseMachineConfig';
import { ControlStashConfig } from './CseMachineControlStash';
import { Layout } from './CseMachineLayout';
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
} from './CseMachineTypes';

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
  fontSize: number = Number(Config.FontSize)
): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

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
        ? CseMachine.getPrintableMode()
          ? Config.SA_BLUE.toString()
          : Config.SA_WHITE.toString()
        : node.attrs.stroke,
      fill: node.attrs.fill
        ? CseMachine.getPrintableMode()
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
  unhighlightOnHover: () => void
): ControlItemComponent {
  const topItem = CseMachine.getStackTruncated()
    ? index === Math.min(Layout.control.size() - 1, 9)
    : index === Layout.control.size() - 1;
  if (!isInstr(controlItem)) {
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
          Layout.compactLevels.reduce<Frame | undefined>(
            (accum, level) =>
              accum
                ? accum
                : level.frames.find(frame => frame.environment?.id === getEnvID(envInstr.env)),
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

export function getStashItemComponent(stashItem: StashValue, stackHeight: number, index: number) {
  if (isFn(stashItem) || isGlobalFn(stashItem) || isArray(stashItem)) {
    for (const level of Layout.compactLevels) {
      for (const frame of level.frames) {
        if (isFn(stashItem) || isGlobalFn(stashItem)) {
          const fn: FnValue | GlobalFnValue | undefined = frame.bindings.find(binding => {
            if (isFn(stashItem) && isFn(binding.data)) {
              return binding.data.id === stashItem.id;
            } else if (isGlobalFn(stashItem) && isGlobalFn(binding.data)) {
              return binding.data?.toString() === stashItem.toString();
            }
            return false;
          })?.value as unknown as FnValue | GlobalFnValue;
          if (fn) return new StashItemComponent(stashItem, stackHeight, index, fn);
        } else {
          const ar: ArrayValue | undefined = frame.bindings.find(binding => {
            if (isArray(binding.data)) {
              return binding.data === stashItem;
            }
            return false;
          })?.value as ArrayValue;
          if (ar) return new StashItemComponent(stashItem, stackHeight, index, ar);
        }
      }
    }
  }
  return new StashItemComponent(stashItem, stackHeight, index);
}

// Helper function to get environment ID. Accounts for the hidden prelude environment right
// after the global environment. Does not need to be used for frame environments, only for
// environments from the context.
export const getEnvID = (environment: Environment): string =>
  environment.tail?.name === 'global' ? environment.tail.id : environment.id;

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

export const defaultSAColor = () =>
  CseMachine.getPrintableMode()
    ? CompactConfig.SA_BLUE.toString()
    : CompactConfig.SA_WHITE.toString();

export const stackItemSAColor = (index: number) =>
  isStashItemInDanger(index)
    ? ControlStashConfig.STASH_DANGER_ITEM.toString()
    : CseMachine.getPrintableMode()
    ? ControlStashConfig.SA_BLUE.toString()
    : ControlStashConfig.SA_WHITE.toString();
export const currentItemSAColor = (test: boolean) =>
  test
    ? CompactConfig.SA_CURRENT_ITEM.toString()
    : CseMachine.getPrintableMode()
    ? ControlStashConfig.SA_BLUE.toString()
    : ControlStashConfig.SA_WHITE.toString();
