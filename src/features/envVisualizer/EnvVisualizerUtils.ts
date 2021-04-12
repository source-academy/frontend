import { Node } from 'konva/types/Node';

import { Config } from './EnvVisualizerConfig';
import { Data, EmptyObject, Env, FnTypes, PrimitiveTypes } from './EnvVisualizerTypes';

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
  return isEmptyObject(env.head);
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

/** checks if `data` is a primitive, defined as a null | data | number */
export function isPrimitiveData(data: Data): data is PrimitiveTypes {
  return isUndefined(data) || isNull(data) || isString(data) || isNumber(data);
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
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!context) return 0;
  context.font = font;
  const longestText = text
    .split('\n')
    .reduce<string>(
      (accText, currValue) =>
        context.measureText(accText).width > context.measureText(currValue).width
          ? accText
          : currValue,
      ''
    );
  const metrics = context.measureText(longestText);
  return metrics.width;
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
