import { Binding } from '../../components/Binding';
import { Frame } from '../../components/Frame';
import { Visible } from '../../components/Visible';
import { AnimationConfig } from './Animatable';

/** Omits the index signature `[key: string]: any;` from type `T` */
export type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : symbol extends K
    ? never
    : K]: T[K];
};

/** A true intersection of the properties of types `A` and `B`, unlike the confusingly named
 * "Intersection Types" in TypeScript which uses the `&` operator and are actually unions.
 * This also excludes the index signature from both `A` and `B` automatically. */
export type SharedProperties<A, B> = Pick<A, Extract<keyof RemoveIndex<A>, keyof RemoveIndex<B>>>;

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

// Compare two given frames and return whether they are actually different, and that
// the second frame is a newly created frame
export function checkFrameCreation(prevFrame: Frame, currFrame: Frame): boolean {
  return prevFrame.environment.id !== currFrame.environment.id;
}

function parseHexColor(color: string): [number, number, number] {
  if (!color.startsWith('#') || (color.length !== 4 && color.length !== 7)) {
    throw new Error(`Cannot parse given color string: ${color}`);
  }
  if (color.length === 4) color = color + color.slice(1);
  return [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16)
  ];
}

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
export function lerpColor(
  startColor: string,
  endColor: string,
  delta: number,
  easingFn: NonNullable<AnimationConfig['easing']>
): `#${string}` {
  const startRgb = parseHexColor(startColor);
  const endRgb = parseHexColor(endColor);
  const rgb = Array.from({ length: 3 }, (_, i) =>
    Math.round(easingFn(delta, startRgb[i], endRgb[i] - startRgb[i], 1))
  );
  return convertRgbToHex(rgb as [number, number, number]);
}
