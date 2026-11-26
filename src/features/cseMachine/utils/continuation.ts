import type { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';

import type { Environment } from '../CseRenderTypes';

/**
 * A continuation, as the renderer reads one: a function value that holds the control, the stash and
 * the environments of the point where it was captured. js-slang's `Continuation` has these members
 * (and is a function, so it is also one of the values that a frame can hold).
 */
export type Continuation = Function & {
  /** Unique id of the continuation. */
  readonly id: string;
  getControl(): Control;
  getStash(): Stash;
  getEnv(): Environment[];
};

export function isContinuation(data: any): data is Continuation {
  return (data as any)?.toString() === 'continuation';
}
