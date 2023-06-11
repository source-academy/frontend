import {
  AgendaItem,
  AssmtInstr,
  BinOpInstr,
  EnvInstr,
  Instr,
  InstrType,
  UnOpInstr
} from 'js-slang/dist/ec-evaluator/types';
import Closure from 'js-slang/dist/interpreter/closure';
import { Environment } from 'js-slang/dist/types';
import { astToString } from 'js-slang/dist/utils/astToString';
import { Group } from 'konva/lib/Group';
import { Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { cloneDeep } from 'lodash';

import { Frame } from './compactComponents/Frame';
import { StackItemComponent } from './compactComponents/StackItemComponent';
import { FnValue } from './compactComponents/values/FnValue';
import { GlobalFnValue } from './compactComponents/values/GlobalFnValue';
import { Value as CompactValue } from './compactComponents/values/Value';
import { Binding } from './components/Binding';
import { Value } from './components/values/Value';
import EnvVisualizer from './EnvVisualizer';
import { Config } from './EnvVisualizerConfig';
import { Layout } from './EnvVisualizerLayout';
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

export const truncateText = (programStr: string): string => {
  const maxWidth = StackItemComponent.maxTextWidth;

  // Truncate so item component looks like a square
  const maxHeight = StackItemComponent.maxTextHeight;

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
 * @param command An AgendaItem
 * @returns true if the AgendaItem is an instruction and false otherwise.
 */
export const isInstr = (command: AgendaItem): command is Instr => {
  return (command as Instr).instrType !== undefined;
};

export function getAgendaItemComponent(
  agendaItem: AgendaItem,
  stackHeight: number
): StackItemComponent {
  if (!isInstr(agendaItem)) {
    switch (agendaItem.type) {
      // case 'BlockStatement':
      //   return new StackItemComponent('BlockStatement', true, stackHeight);
      // case 'WhileStatement':
      //   return new StackItemComponent('WhileStatement', true, stackHeight);
      // case 'ForStatement':
      //   return new StackItemComponent('ForStatement', true, stackHeight);
      // case 'IfStatement':
      //   return new StackItemComponent('IfStatement', true, stackHeight);
      // case 'ExpressionStatement':
      //   return new StackItemComponent('ExpressionStatement', true, stackHeight);
      // case 'DebuggerStatement':
      //   return new StackItemComponent('DebuggerStatement', true, stackHeight);
      // case 'VariableDeclaration':
      //   return new StackItemComponent('VariableDeclaration', true, stackHeight);
      // case 'FunctionDeclaration':
      //   return new StackItemComponent('FunctionDeclaration', true, stackHeight);
      // case 'ReturnStatement':
      //   return new StackItemComponent('ReturnStatement', true, stackHeight);
      // case 'ContinueStatement':
      //   return new StackItemComponent('ContinueStatement', true, stackHeight);
      // case 'BreakStatement':
      //   return new StackItemComponent('BreakStatement', true, stackHeight);
      // case 'ImportDeclaration':
      //   return new StackItemComponent('ImportDeclaration', true, stackHeight);
      case 'Literal':
        return new StackItemComponent(
          typeof agendaItem.value === 'string' ? `"${agendaItem.value}"` : agendaItem.value,
          true,
          stackHeight
        );
      // case 'AssignmentExpression':
      //   return new StackItemComponent('AssignmentExpression', true, stackHeight);
      // case 'ArrayExpression':
      //   return new StackItemComponent('ArrayExpression', true, stackHeight);
      // case 'MemberExpression':
      //   return new StackItemComponent('MemberExpression', true, stackHeight);
      // case 'ConditionalExpression':
      //   return new StackItemComponent('ConditionalExpression', true, stackHeight);
      // case 'Identifier':
      //   return new StackItemComponent('Identifier', true, stackHeight);
      // case 'UnaryExpression':
      //   return new StackItemComponent('UnaryExpression', true, stackHeight);
      // case 'BinaryExpression':
      //   return new StackItemComponent('BinaryExpression', true, stackHeight);
      // case 'LogicalExpression':
      //   return new StackItemComponent('LogicalExpression', true, stackHeight);
      // case 'ArrowFunctionExpression':
      //   return new StackItemComponent('ArrowFunctionExpression', true, stackHeight);
      // case 'CallExpression':
      //   return new StackItemComponent('CallExpression', true, stackHeight);
      default:
        return new StackItemComponent(
          truncateText(astToString(agendaItem).trim()),
          true,
          stackHeight
        );
    }
  } else {
    switch (agendaItem.instrType) {
      case InstrType.RESET:
        return new StackItemComponent('RESET', true, stackHeight);
      case InstrType.WHILE:
        return new StackItemComponent('WHILE', true, stackHeight);
      case InstrType.FOR:
        return new StackItemComponent('FOR', true, stackHeight);
      case InstrType.ASSIGNMENT:
        const assmtInstr = agendaItem as AssmtInstr;
        return new StackItemComponent(`ASSIGN ${assmtInstr.symbol}`, true, stackHeight);
      case InstrType.UNARY_OP:
        const unOpInstr = agendaItem as UnOpInstr;
        return new StackItemComponent(unOpInstr.symbol, true, stackHeight);
      case InstrType.BINARY_OP:
        const binOpInstr = agendaItem as BinOpInstr;
        return new StackItemComponent(binOpInstr.symbol, true, stackHeight);
      case InstrType.POP:
        return new StackItemComponent('POP', true, stackHeight);
      case InstrType.APPLICATION:
        return new StackItemComponent('APPLICATION', true, stackHeight);
      case InstrType.BRANCH:
        return new StackItemComponent('BRANCH', true, stackHeight);
      case InstrType.ENVIRONMENT:
        const envInstr = agendaItem as EnvInstr;
        return new StackItemComponent(
          'ENVIRONMENT',
          true,
          stackHeight,
          Layout.compactLevels.reduce<Frame | undefined>(
            (accum, level) =>
              accum ? accum : level.frames.find(frame => frame.environment?.id === envInstr.env.id),
            undefined
          )
        );
      case InstrType.PUSH_UNDEFINED_IF_NEEDED:
        return new StackItemComponent('PUSH_UNDEFINED_IF_NEEDED', true, stackHeight);
      case InstrType.ARRAY_LITERAL:
        return new StackItemComponent('ARRAY_LITERAL', true, stackHeight);
      case InstrType.ARRAY_ACCESS:
        return new StackItemComponent('ARRAY_ACCESS', true, stackHeight);
      case InstrType.ARRAY_ASSIGNMENT:
        return new StackItemComponent('ARRAY_ASSIGNMENT', true, stackHeight);
      case InstrType.CONTINUE:
        return new StackItemComponent('CONTINUE', true, stackHeight);
      case InstrType.CONTINUE_MARKER:
        return new StackItemComponent('CONTINUE_MARKER', true, stackHeight);
      case InstrType.BREAK:
        return new StackItemComponent('BREAK', true, stackHeight);
      case InstrType.BREAK_MARKER:
        return new StackItemComponent('BREAK_MARKER', true, stackHeight);
      default:
        return new StackItemComponent('INSTRUCTION', true, stackHeight);
    }
  }
}

export function getStashItemComponent(stashItem: any, stackHeight: number) {
  if (stashItem instanceof Closure) {
    let fn: FnValue | GlobalFnValue | undefined;
    for (const level of Layout.compactLevels) {
      for (const frame of level.frames) {
        fn = frame.bindings.find(binding => {
          if (isFn(binding.data)) {
            return binding.data.id === stashItem.id;
          }
          return false;
        })?.value as FnValue | GlobalFnValue;
      }
    }
    if (fn) return new StackItemComponent('', false, stackHeight, fn);
  }
  return new StackItemComponent(
    typeof stashItem === 'string' ? `"${stashItem}"` : stashItem,
    false,
    stackHeight
  );
}
