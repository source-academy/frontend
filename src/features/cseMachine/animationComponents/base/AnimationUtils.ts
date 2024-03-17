import { Binding } from '../../components/Binding';
import { Frame } from '../../components/Frame';
import { UnassignedValue } from '../../components/values/UnassignedValue';
import { Visible } from '../../components/Visible';

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

export function getNodePosition(item: Visible) {
  return {
    x: item.x(),
    y: item.y(),
    height: item.height(),
    width: item.width()
  };
}

// Given a current frame, find a binding by traversing the enclosing environments (frames).
export function lookupBinding(currFrame: Frame, bindingName: string): [Frame, Binding] {
  let frame: Frame | undefined = currFrame;
  while (frame !== undefined) {
    const binding = frame.bindings.find(b => b.keyString.split(':')[0] === bindingName);
    // return the top most global frame if we have reached the top of the tree
    if (frame?.environment?.id === '-1') {
      return [frame, frame.bindings[0]];
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
  // If the names are different, then they are definitely not the same frame.
  if (prevFrame.name.fullStr !== currFrame.name.fullStr) return true;
  // If currFrame is a newly created frame, all bindings will be unassigned, and
  // prevFrame will have no assigned bindings. Exception will be the global frame
  const prevFrameHasUnassigned = prevFrame.bindings.reduce((result, binding) => {
    return result || binding.value instanceof UnassignedValue;
  }, false);
  const currFrameHasAllUnassigned = currFrame.bindings.reduce((result, binding) => {
    return result && binding.value instanceof UnassignedValue;
  }, true);
  if (prevFrameHasUnassigned || !currFrameHasAllUnassigned) return false;
  // As a last resort, we check the frame positions for any difference. Since
  // no frames are ever deleted over the lifetime of the CSE Machine, we can assume
  // that newer frames would have either a larger `x` or `y` value
  return prevFrame.x() < currFrame.x() || prevFrame.y() < currFrame.y();
}
