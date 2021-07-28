import { Node } from 'konva/types/Node';

import { Value } from './components/values/Value';
import { Config } from './EnvVisualizerConfig';
import {
  Data,
  EmptyObject,
  Env,
  FnTypes,
  PrimitiveTypes,
  ReferenceType
} from './EnvVisualizerTypes';

/** checks if `x` is an object */
export function isObject(x: any): x is object {
  return x === Object(x);
}

/** checks if `object` is empty */
export function isEmptyObject(object: Object): object is EmptyObject {
  return Object.keys(object).length === 0;
}

/** checks if `env` is empty (that is, head of env is an empty object) */
export function isEmptyEnvironment(env: Env): env is Env & { head: EmptyObject } {
  return env === null || isEmptyObject(env.head);
}

/** checks if `data` is a Javascript array */
export function isArray(data: Data): data is Data[] {
  return Array.isArray(data);
}

/** checks if `x` is a Javascript function */
export function isFunction(x: any): x is () => any {
  return x && {}.toString.call(x) === '[object Function]';
}

/** checks if `data` is a JS Slang function */
export function isFn(data: Data): data is FnTypes {
  return isFunction(data) && 'environment' in data && 'functionName' in data;
}

/** checks if `x` is a JS Slang function in the global frame */
export function isGlobalFn(x: any): x is () => any {
  return isFunction(x) && !isFn(x);
}

/** checks if `data` is null */
export function isNull(data: Data): data is null {
  return data === null;
}

/** checks if `data` is undefined */
export function isUndefined(data: Data): data is undefined {
  return data === undefined;
}

/** checks if `data` is a string */
export function isString(data: Data): data is string {
  return typeof data === 'string';
}

/** checks if `data` is a number */
export function isNumber(data: Data): data is number {
  return typeof data === 'number';
}

/** checks if `data` is a symbol */
export function isUnassigned(data: Data): data is symbol {
  return typeof data === 'symbol';
}

/** checks if `data` is a primitive, defined as a null | data | number */
export function isPrimitiveData(data: Data): data is PrimitiveTypes {
  return isUndefined(data) || isNull(data) || isString(data) || isNumber(data);
}

/** checks if `reference` is the main reference of the `value` */
export function isMainReference(value: Value, reference: ReferenceType) {
  return value.referencedBy[0] === reference;
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
  if (!context) {
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

/** get the parameter string of the given function */
export function getParamsText(data: () => any): string {
  if (isFn(data)) {
    return data.node.params.map((node: any) => node.name).join(',');
  } else {
    const fnString = data.toString();
    return fnString.substring(fnString.indexOf('('), fnString.indexOf('{')).trim();
  }
}

/** get the body string of the given function */
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

/** update the styles of a Konva node and its children on hover, and then redraw the layer */
export function setHoveredStyle(target: Node, hoveredAttrs: any = {}): void {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'pointer');

  const nodes = Array.from(target.children);
  nodes.push(target);
  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke ? Config.HoveredColor.toString() : node.attrs.stroke,
      fill: node.attrs.fill ? Config.HoveredColor.toString() : node.attrs.fill,
      ...hoveredAttrs
    });
  });

  // TODO: it is not recommended to use node.zIndex(5), node.moveToTop()
  // when you are working with the React framework.
  // see here: https://konvajs.org/docs/react/zIndex.html
  target.moveToTop();
  // TODO: likewise, re-implement Layout.tsx to
  // achieve setHoveredStyle by manipulating the state.
  target.getLayer()?.draw();
}

/** update the styles of a Konva node and its children on unhover, and then redraw the layer */
export function setUnhoveredStyle(target: Node, unhoveredAttrs: any = {}): void {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'default');

  const nodes = Array.from(target.children);
  nodes.push(target);
  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke ? Config.SA_WHITE.toString() : node.attrs.stroke,
      fill: node.attrs.fill ? Config.SA_WHITE.toString() : node.attrs.fill,
      ...unhoveredAttrs
    });
  });

  target.getLayer()?.draw();
}

/** extract the non-empty tail environment from the given environment */
export function getNonEmptyEnv(environment: Env): Env {
  if (environment === null) {
    return null;
  } else if (isEmptyEnvironment(environment)) {
    return getNonEmptyEnv(environment.tail);
  } else {
    return environment;
  }
}
