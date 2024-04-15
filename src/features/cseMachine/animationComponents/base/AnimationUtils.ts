import { Binding } from '../../components/Binding';
import { Frame } from '../../components/Frame';
import { Visible } from '../../components/Visible';
import { AnimationConfig } from './Animatable';

export function getNodeDimensions(item: Visible) {
  return {
    height: item.height(),
    width: item.width()
  };
}

export function getNodeLocation(item: Visible) {
  return {
    x: item.x(),
    y: item.y()
  };
}

export function getNodePosition(item: Visible) {
  return {
    ...getNodeDimensions(item),
    ...getNodeLocation(item)
  };
}

// Given a current frame, find a binding by traversing the enclosing environments (frames).
export function lookupBinding(currFrame: Frame, bindingName: string): [Frame, Binding] {
  let frame: Frame | undefined = currFrame;
  while (frame !== undefined) {
    const binding = frame.bindings.find(b => b.keyString.split(':')[0] === bindingName);
    // return the top most global frame if we have reached the top of the tree
    if (frame?.environment?.id === '-1') {
      return [frame, binding ?? frame.bindings[0]];
    }
    if (binding) {
      return [frame, binding];
    }
    frame = frame.parentFrame;
  }
  // this line should never be reached as long as the interpreter works correctly
  throw new Error(
    `Error: Binding with name "${bindingName}" cannot be found within the environment!`
  );
}

/** Simple check for if a string is a hex color string. Does not check individual characters. */
function isHexColor(value: string): boolean {
  return value.startsWith('#') && (value.length === 4 || value.length === 7);
}

/** Converts a hex color string to a 3-element rgb array */
function parseHexColor(color: string): [number, number, number] {
  if (!isHexColor(color)) {
    throw new Error(`Cannot parse given color string: ${color}`);
  }
  if (color.length === 4) color = color + color.slice(1);
  return [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  ];
}

/** Converts a rgb array to hex color string */
function convertRgbToHex([r, g, b]: [number, number, number]): `#${string}` {
  return `#${
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  }`;
}

/**
 * Interpolates between the colors based on the given delta and easing function.
 * Only supports hex colors, e.g. `#000`, `#abcdef`, etc.
 */
function lerpColor(
  delta: number,
  startColor: string | undefined,
  endColor: string,
  easingFn: NonNullable<AnimationConfig['easing']>
): `#${string}` {
  if (!startColor) return endColor as `#${string}`;
  const startRgb = parseHexColor(startColor);
  const endRgb = parseHexColor(endColor);
  const rgb = Array.from({ length: 3 }, (_, i) =>
    Math.round(easingFn(delta, startRgb[i], endRgb[i] - startRgb[i], 1))
  );
  return convertRgbToHex(rgb as [number, number, number]);
}

/**
 * Interpolates between `startValue` and `endValue` at the given `delta`, depending on the given
 * `property` and `easingFn`.
 * Only supports interpolation between numbers, or color strings
 */
export function lerp(
  delta: number,
  property: string,
  startValue: any,
  endValue: any,
  easingFn: NonNullable<AnimationConfig['easing']>
): any {
  if (startValue === endValue) return endValue;
  if (typeof endValue === 'number') {
    if (typeof startValue !== 'number') return endValue;
    return easingFn(delta, startValue, endValue - startValue, 1);
  } else if (property === 'fill' || property === 'stroke') {
    return lerpColor(delta, startValue, endValue, easingFn);
  } else {
    return endValue;
  }
}
